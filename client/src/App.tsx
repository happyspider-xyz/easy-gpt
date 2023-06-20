import { useEffect, useState } from "react";
import { SetAuth } from "./SetAuth";
import { Progress, ProgressBox } from "./ProgressBox";
import ReactMarkdown from "react-markdown";
function App() {
  const [config, setConfig] = useState<any>();
  const [results, setResults] = useState<any>();
  const [socket, setSocket] = useState<WebSocket>();

  const [progress, setProgress] = useState<Progress>();

  useEffect(() => {
    const s = new WebSocket("ws://localhost:3790");
    s.onmessage = (e) => {
      let payload = e.data;

      try {
        payload = JSON.parse(payload);
      } catch (e) {}

      if (typeof payload === "object") {
        if (payload?.command === "setConfig") setConfig(payload?.data);
        if (payload?.command === "setAdvices") setResults(payload?.data);
        if (payload?.command === "setProgress") setProgress(payload?.data);
      }
    };

    s.onopen = () => {
      // running react app locally using npm run start in /client folder
      if (window.location.port === "3791")
        s?.send(
          JSON.stringify({
            command: "loadTestContent",
          })
        );
      console.log("sent");
    };
    setSocket(s);
  }, []);
  return (
    <>
      <ProgressBox progress={progress} />

      <div className="p-10">
        {!config?.auth?.mode ? (
          <SetAuth
            onSave={(token) => {
              socket?.send(
                JSON.stringify({
                  command: "saveConfig",
                  data: { auth: { token, mode: "OpenAI" } },
                })
              );
            }}
          />
        ) : (
          <>
            <div className="min-h-2/3">
              <ReactMarkdown>{results?.advices}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
