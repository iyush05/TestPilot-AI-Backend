import { runDocker } from "../../docker/runner";
import { fixTests } from "./fixTests";
import { writeMultipleTests } from "../../utils/file";
import { getSourceFiles } from "../../utils/scan";
import { createPR } from "../github/pr";

const send = (socket: any, type: string, message: string) =>
  socket.send(JSON.stringify({ type, message }));

export async function runAgentLoop(
  repoPath: string,
  socket: any,
  repoUrl: string
) {
  let attempts = 0;
  const maxRetries = 3;

  const send = (type: string, message: string) =>
    socket.send(JSON.stringify({ type, message }));

  send("log", "Creating PR...");
  const prUrl = await createPR(repoPath, repoUrl);
  send("pr", prUrl); // ← this is what triggers setPrUrl in frontend

  while (attempts < maxRetries) {
    send("log", `Running tests (attempt ${attempts + 1})...`);

    const result = await runDocker(repoPath, (log) => {
      send("log", log);
    });

    if (result.success) {
      send("log", "All tests passed!");
      return;
    }

    send("log", "Tests failed. Attempting self-heal...");
    const allTests = getSourceFiles(`${repoPath}/tests`);
    const fixed = await fixTests(allTests, result.logs);
    writeMultipleTests(fixed.tests);
    attempts++;
  }

  send("log", "Max retries reached. Manual review needed.");
}