import { spawn } from "child_process";
import path from "path";

export function runDocker(
  repoPath: string,
  onData: (data: string) => void
) {
  return new Promise<{ success: boolean; logs: string }>((resolve) => {
    let logs = "";

    const absPath = path.resolve(repoPath); // 🔥 IMPORTANT

    console.log("🚀 Starting Docker container...");
    console.log("📦 Mounting:", absPath);

    const command = `
cd /app &&

echo "📦 Installing dependencies..." &&

rm -rf node_modules package-lock.json &&
npm cache clean --force &&
npm config set fund false &&
npm config set audit false &&

if [ -f package-lock.json ]; then
  npm ci --ignore-scripts;
else
  npm install --no-audit --no-fund --ignore-scripts;
fi &&

echo "🧪 Checking for Jest..." &&

if ! npx --yes jest --version > /dev/null 2>&1; then
  echo "⚠️ Jest not found. Installing Jest..." &&
  npm install jest ts-jest @types/jest --save-dev &&
  npx ts-jest config:init || true;
fi &&

echo "🚀 Running tests..." &&

npx jest --coverage
`;

    console.log("🐳 Docker command:", command);

    const container = spawn("docker", [
      "run",
      "--rm",
      "--memory=512m",
      "--cpus=0.5",
      "--network=none",
      "-v",
      `${absPath}:/app`, // ✅ absolute path
      "-w",
      "/app", // 🔥 ensures correct working dir
      "node:18", // 🔥 FIX: avoid alpine
      "sh",
      "-c",
      command,
    ]);

    container.on("error", (err) => {
      console.error("Docker spawn error:", err);
      onData("Docker failed to start\n");
      resolve({ success: false, logs: err.message });
    });

    container.stdout.on("data", (data) => {
      const text = data.toString();
      logs += text;
      onData(text);
    });

    container.stderr.on("data", (data) => {
      const text = data.toString();
      logs += text;
      onData("ERR: " + text);
    });

    container.on("close", (code) => {
      console.log("🏁 Docker exited with code:", code);

      if (!logs) {
        console.log("No logs received from container");
      }

      resolve({ success: code === 0, logs });
    });
  });
}