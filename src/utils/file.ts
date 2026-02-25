import fs from "fs";
import path from "path";

export function readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}


export function writeTestFile(content: string, name: string) {
  const dir = "sandbox/tests";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(`${dir}/${name}`, content);
}

export function isValidFile(file: string) {
  return (
    !file.includes("node_modules") &&
    !file.includes("test") &&
    !file.includes("config") &&
    !file.includes("dist") &&
    (file.endsWith(".ts") || file.endsWith(".js"))
  );
}

export function isRelevantFile(file: string) {
  return (
    (file.endsWith(".ts") || file.endsWith(".js")) &&
    !file.includes("node_modules") &&
    !file.includes("test") &&
    !file.includes("dist") &&
    !file.includes("build") &&
    !file.includes(".config") &&
    !file.includes("coverage")
  );
}

export function buildRepoContext(files: string[]) {
  let context = "";

  for (const file of files) {
    const code = fs.readFileSync(file, "utf-8");

    context += `
FILE: ${file}
--------------------
${code}

====================
`;
  }

  return context;
}

export function writeMultipleTests(tests: any[]) {
  const baseDir = "sandbox/tests";

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (const test of tests) {
    const filePath = path.join(baseDir, test.fileName);

    // 🔥 IMPORTANT: ensure directory exists
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, test.content);

    console.log("Created:", filePath);
  }
}