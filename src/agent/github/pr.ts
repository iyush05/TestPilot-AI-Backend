import simpleGit from "simple-git";
import axios from "axios";
import path from "path";

export async function createPR(repoPath: string, repoUrl: string) {
  const git = simpleGit(repoPath);

  const match = repoUrl.match(/github.com\/(.*)\/(.*).git/);
  if (!match) throw new Error("Invalid repo URL");

  const owner = match[1];
  const repo = match[2];
  const token = process.env.GITHUB_TOKEN;
  const authRepoUrl = `https://${token}@github.com/iyush05-alt/${repo}.git`

  const branchName = `ai-tests-${Date.now()}`;

  console.log("Creating branch:", branchName);

  await git.checkoutLocalBranch(branchName);

  await git.add("./*");

  await git.commit("✨ Add AI-generated tests");

  await git.remote(["set-url", "origin", authRepoUrl]);

  await git.push("origin", branchName);

  console.log("Branch pushed");

//   // Extract owner/repo
//   const match = repoUrl.match(/github.com\/(.*)\/(.*).git/);

//   if (!match) {
//     throw new Error("Invalid repo URL");
//   }

//   const owner = match[1];
//   const repo = match[2];

  const pr = await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      title: "🤖 AI Generated Tests",
      head: `iyush05-alt:${branchName}`,
      base: "main",
      body: "This PR contains automatically generated and validated test cases.",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  console.log("PR Created:", pr.data.html_url);

  return pr.data.html_url;
}