// import http from "http";
// import { cloneRepo } from "./agent/git/clone";
// import { getSourceFiles } from "./utils/scan";
// import { buildRepoContext, isRelevantFile, isValidFile, readFile, writeMultipleTests, writeTestFile } from "./utils/file";
// import { generateTests } from "./agent/llm/generateTests";
// import { setupWebSocket } from "./websocket/socket";
// import { parseTests } from "./agent/parser/parser";
// import { runAgentLoop } from "./agent/llm/loop";

// const server = http.createServer();
// const wss = setupWebSocket(server);

// async function main() {
//   const repoUrl = "https://github.com/iyush05/attendance-system.git";

//   // 1. Clone repo
//   cloneRepo(repoUrl);

//   // 2. Get source files
//   const allFiles = getSourceFiles("sandbox");
//   const files = allFiles
//   .filter(isRelevantFile)

//   const context = buildRepoContext(files.slice(0, 10));

//   const rawOutput = await generateTests(context);
//   console.log("Raw LLM Output:", rawOutput);

//   const parsed = parseTests(rawOutput);

//   writeMultipleTests(parsed.tests);

//   console.log("Test generated at sandbox/tests/");

//   wss.on("connection", (ws) => {
//     runAgentLoop("sandbox", ws);
//   });

//   server.listen(3001, () => {
//   console.log("Server running on port 3001");
//   });
// }

// main();

import http from "http";
import { cloneRepo } from "./agent/git/clone";
import { getSourceFiles } from "./utils/scan";
import { buildRepoContext, isRelevantFile, writeMultipleTests } from "./utils/file";
import { generateTests } from "./agent/llm/generateTests";
import { setupWebSocket } from "./websocket/socket.ts";
import { parseTests } from "./agent/parser/parser";
import { runAgentLoop } from "./agent/llm/loop";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});
const wss = setupWebSocket(server);

server.listen(3001, async () => {
  console.log("Server running on port 3001");

  const repoUrl = "https://github.com/iyush05/attendance-system.git";

  cloneRepo(repoUrl);

  const allFiles = getSourceFiles("sandbox");
  const files = allFiles.filter(isRelevantFile);

  const context = buildRepoContext(files.slice(0, 10));

  const rawOutput = await generateTests(context);
  const rawOutputString = rawOutput.map((block: any) => block.text).join("");
  const parsed = parseTests(rawOutputString);

  writeMultipleTests(parsed.tests);

  console.log("Tests generated");
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  // 🔥 NOW this will run when frontend connects
  runAgentLoop("sandbox", ws);
});