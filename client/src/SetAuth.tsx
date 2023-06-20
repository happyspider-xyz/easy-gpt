import { useEffect, useState } from "react";
export function SetAuth({ onSave }: { onSave: (token: string) => void }) {
  const [token, setToken] = useState("");

  return (
    <div className="max-w-md">
      <h1 className="text-4xl">Welcome to easy gpt</h1>
      <h2 className="text-2xl mt-2">Authenticate with OpenAI</h2>
      <ol className="p-6">
        <li className="m-2">
          <label className="font-bold"> 1. Enter OpenAI API key</label>
          <p className="font-light p-4 py-2 text-sm">
            Communicates with OpenAI directly from your machine, credentials
            will be saved locally
          </p>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sk-z8nIkW................."
            className="h-8 block mx-4 m-6 w-full border-gray-300 border-solid border-2 box-border max-w-xs px-2 text-black rounded-sm"
            type="text"
          />
          <button
            type="button"
            onClick={() => onSave(token)}
            className="bg-yellow-500 font-bold float-right px-4 py-2 rounded-lg text-black "
          >
            Save
          </button>
          <div className="clear-both"></div>
        </li>

        <li className="m-2 mt-8 pt-8 border-dashed border-t-2 border-gray-500">
          <label className="font-bold">2. HappySpider Proxy</label>
          <p className="font-light p-4 py-2 text-sm">
            Will use HappySpider servers to communicate with OpenAI API, queries
            won't be kept in any database or logs on HappySpider servers.
          </p>
          <button className="bg-yellow-500 font-bold float-right px-4 py-2 rounded-lg mt-6  text-black">
            Login
          </button>
        </li>
      </ol>
    </div>
  );
}
