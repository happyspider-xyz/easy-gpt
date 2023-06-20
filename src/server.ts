import { createHash } from "crypto";
import * as express from "express";
import {
  existsSync,
  mkdirSync,
  readFile,
  readFileSync,
  writeFileSync,
} from "fs";
import * as http from "http";
import { Configuration, OpenAIApi } from "openai";
import path = require("path");
import * as WebSocket from "ws";

const defaultConfig = {};
const configPath = path.join(__dirname, "../easy-gpt.config.json");
const cacheFolder = path.join(__dirname, "../cache");
if (!existsSync(cacheFolder)) mkdirSync(cacheFolder);
let wss: WebSocket.Server;

let processing = false;

function setResults(results?: { advices?: string }) {
  wss.clients.forEach((socket) =>
    socket.send(
      JSON.stringify({
        command: "setAdvices",
        data: results,
      })
    )
  );
}

function setProgress(title: string, state: "ongoing" | "finished" | "failed") {
  wss.clients.forEach((socket) =>
    socket.send(
      JSON.stringify({
        command: "setProgress",
        data: { title, state },
      })
    )
  );
}

export function processFile(fileContent: string, fileName: string) {
  if (processing) return;

  processing = true;

  setProgress(`Analyzing ${fileName}`, "ongoing");

  const sha = createHash("sha256").update(fileContent).digest("hex");
  const cachePath = path.join(cacheFolder, sha + ".json");
  if (existsSync(cachePath)) {
    try {
      const payload = JSON.parse(readFileSync(cachePath).toString());
      setResults(payload);
      setProgress(`Analyzing ${fileName} done`, "finished");
    } catch (error) {
      console.error(error);
    }

    processing = false;

    return;
  }

  const config = loadConfig();

  if (config?.auth?.mode === "OpenAI") {
    const configuration = new Configuration({
      apiKey: config.auth.token,
    });

    const openai = new OpenAIApi(configuration);

    const prompt =
      `review code and write results in markdown format\n` + fileContent;

    //log the received message and send it back to the client
    openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "assistant",
            content: prompt,
          },
        ],
      })
      .then((res) => {
        const content = res.data.choices[0]?.message?.content || "";
        const results = { advices: content };
        // writeFileSync(cachePath, JSON.stringify(results, null, 2));
        setResults(results);
        processing = false;
        setProgress(`Analyzing ${fileName} done`, "finished");
      })
      .catch((e) => {
        wss.clients.forEach((socket) => socket.send(e));
        processing = false;
        setProgress(`Analyzing ${fileName} failed`, "failed");
      });
  }
}

export function saveConfig(config: any) {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function loadConfig() {
  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  } else {
    return JSON.parse(readFileSync(configPath).toString());
  }
}
export async function bootstrap(): Promise<WebSocket.Server> {
  return new Promise((resolve) => {
    const hostname = "localhost";
    const port = 3790;

    const app = express();
    const server = http.createServer(app);

    app.use((req, res, next) => {
      console.log(req.url);
      next();
    });
    app.use(express.static(path.join(__dirname, "..", "public"), {}));

    app.get("/", () => {});

    wss = new WebSocket.Server({ server });

    wss.on(
      "connection",
      async (ws: WebSocket, request: http.IncomingMessage) => {
        //connection is up, let's add a simple simple event

        const config = loadConfig();

        ws.send(JSON.stringify({ command: "setConfig", data: config }));
        ws.on("message", async (message: string) => {
          let payload: { command?: string; data?: any } | undefined;

          try {
            payload = JSON.parse(message);
          } catch (error) {}

          console.log(payload || message, request.connection.address());

          if (!payload) return;

          if (payload.command === "saveConfig") {
            const update = { ...config, ...payload.data };
            saveConfig(update);
            ws.send(JSON.stringify({ command: "setConfig", data: update }));
          }

          if (payload.command === "loadTestContent") {
            processFile(
              readFileSync(
                path.join(__dirname, "../src/extension.ts")
              ).toString(),
              "extension.ts"
            );
          }
        });
      }
    );

    server.listen(port, hostname, () => {
      console.log(`Started listening on http://${hostname}:${port}`);
      resolve(wss);
    });
  });
}
