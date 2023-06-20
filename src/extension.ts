// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as server from "./server";
import { readFileSync } from "fs";
import path = require("path");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "easy-gpt" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const openView = vscode.commands.registerCommand(
    "easy-gpt.openView",
    async () => {
      await server.bootstrap();

      let lastActiveFilePath: string;
      setInterval(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const activeFilePath = editor.document.uri.fsPath;
          if (lastActiveFilePath !== activeFilePath) {
            lastActiveFilePath = activeFilePath;

            const content = readFileSync(editor.document.fileName).toString();
            server.processFile(
              content,
              path.basename(editor.document.fileName)
            );
          }
        }
      }, 1000);

      const panel = vscode.window.createWebviewPanel(
        "easyGptView",
        "Easy GPT View",
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = `<iframe style="top:0; left:0; width:100%; height:100%; position:absolute;" src="${"http://localhost:3790"}" frameBorder="0"></iframe>`;
    }
  );

  context.subscriptions.push(openView);

  vscode.commands.executeCommand("easy-gpt.openView");
}

// This method is called when your extension is deactivated
export function deactivate() {}
