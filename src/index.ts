import http from "http";
import { cloneRepo } from "./agent/git/clone";
import { getSourceFiles } from "./utils/scan";
import { buildRepoContext, isRelevantFile, writeMultipleTests } from "./utils/file";
import { generateTests } from "./agent/llm/generateTests";
import { setupWebSocket } from "./websocket/socket.ts";
import { parseTests } from "./agent/parser/parser";
import { runAgentLoop } from "./agent/llm/loop";
import axios from "axios";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});
const wss = setupWebSocket(server);

server.listen(3001, () => {
  console.log("Server running on port 3001");
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (!data.repoUrl) {
        ws.send("No repoUrl provided");
        return;
      }

      const repoUrl = data.repoUrl;

      ws.send(`Cloning repo: ${repoUrl}\n`);

      // Extract owner/repo
      const match = repoUrl.match(/github.com\/(.*)\/(.*).git/);

      if (!match) {
        ws.send("Invalid repo URL");
        return;
      }

      const owner = match[1];
      const repo = match[2];

      await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/forks`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    ws.send("Forking repo...\n");


let forkReady = false;

for (let i = 0; i < 10; i++) {
  try {
    await axios.get(
      `https://api.github.com/repos/iyush05-alt/${repo}`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    );
    forkReady = true;
    break;
  } catch (err) {
    await new Promise(res => setTimeout(res, 2000));
  }
}

    if (!forkReady) throw new Error("Fork not ready");

      const forkUrl = `https://github.com/iyush05-alt/${repo}.git`;
      cloneRepo(forkUrl);

      const allFiles = getSourceFiles("sandbox");
      const files = allFiles.filter(isRelevantFile);

      const context = buildRepoContext(files.slice(0, 10));

      ws.send("Generating tests...\n");

      const rawOutput = await generateTests(context);
      const rawOutputString = rawOutput
        .map((block: any) => block.text)
        .join("");

      const parsed = parseTests(rawOutputString);

      writeMultipleTests(parsed.tests);

      ws.send("Tests generated\n");

      await runAgentLoop("sandbox", ws, forkUrl);

    } catch (err: any) {
      console.error(err);
      ws.send("Error: " + err.message);
    }
  });
});