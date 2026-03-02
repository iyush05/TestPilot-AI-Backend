import { cloneRepo } from "./agent/git/clone";
import { getSourceFiles } from "./utils/scan";
import { buildRepoContext, isRelevantFile, writeMultipleTests } from "./utils/file";
import { generateTests } from "./agent/llm/generateTests";
import { parseTests } from "./agent/parser/parser";
import { runAgentLoop } from "./agent/llm/loop";
import axios from "axios";

const send = (ws: any, type: string, message: string) =>
  ws.send(JSON.stringify({ type, message }));

Bun.serve({
  port: 3001,

  fetch(req, server) {
    // Upgrade HTTP → WebSocket
    if (server.upgrade(req)) return;
    return new Response("OK");
  },

  websocket: {
    async message(ws, raw) {
      try {
        const data = JSON.parse(raw.toString());

        if (!data.repoUrl) {
          send(ws, "error", "No repoUrl provided");
          return;
        }

        const repoUrl = data.repoUrl;
        send(ws, "log", `Cloning repo: ${repoUrl}`);

        const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);
        if (!match) {
          send(ws, "error", "Invalid repo URL");
          return;
        }

        const owner = match[1];
        const repo = match[2];

        await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/forks`,
          {},
          { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
        );
        send(ws, "log", "Forking repo...");

        let forkReady = false;
        for (let i = 0; i < 10; i++) {
          try {
            await axios.get(
              `https://api.github.com/repos/iyush05-alt/${repo}`,
              { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
            );
            forkReady = true;
            break;
          } catch {
            await new Promise(res => setTimeout(res, 2000));
          }
        }

        if (!forkReady) throw new Error("Fork not ready");

        const forkUrl = `https://github.com/iyush05-alt/${repo}.git`;
        cloneRepo(forkUrl);

        const allFiles = getSourceFiles("sandbox");
        const files = allFiles.filter(isRelevantFile);
        const context = buildRepoContext(files.slice(0, 10));

        send(ws, "log", "Generating tests...");

        const rawOutput = await generateTests(context);
        const rawOutputString = rawOutput.map((block: any) => block.text).join("");
        const parsed = parseTests(rawOutputString);
        writeMultipleTests(parsed.tests);

        send(ws, "log", "Tests generated");

        await runAgentLoop("sandbox", ws, forkUrl);

      } catch (err: any) {
        console.error(err);
        send(ws, "error", err.message);
      }
    },

    open(ws) {
      console.log("Client connected");
    },

    close(ws) {
      console.log("Client disconnected");
    },
  },
});

console.log("Server running on port 3001");