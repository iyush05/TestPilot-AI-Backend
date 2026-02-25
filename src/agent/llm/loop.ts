import { runDocker } from "../../docker/runner";
import { fixTests } from "./fixTests";
import { writeMultipleTests } from "../../utils/file";
import { getSourceFiles } from "../../utils/scan";
import { createPR } from "../github/pr";

export async function runAgentLoop(
  repoPath: string,
  socket: any, // websocket
  repoUrl: string
) {
  let attempts = 0;
  const maxRetries = 3;

  await createPR(repoPath, repoUrl);
  while (attempts < maxRetries) {
    socket.send(`Running tests (attempt ${attempts + 1})...\n`);

    const result = await runDocker(repoPath, (log) => {
      socket.send(log);
    });

    if (result.success) {
      socket.send("Tests passed!\n");
      socket.send("Tests passed! Creating PR...\n");

      const prUrl = await createPR(repoPath, repoUrl);

      socket.send(`PR Created: ${prUrl}\n`);
      return;
    }

    socket.send("Tests failed. Attempting self-heal...\n");

    const allTests = getSourceFiles(`${repoPath}/tests`);

    const fixed = await fixTests(allTests, result.logs);

    // const parsedTests = parseTests(fixed);
    writeMultipleTests(fixed.tests);

    attempts++;
  }

  socket.send("Max retries reached. Manual review needed.\n");
}