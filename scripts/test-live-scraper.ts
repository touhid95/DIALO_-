import { spawn } from "child_process";
import path from "path";

const appDir = path.join(__dirname, "..", "app");
const child = spawn("npx", ["--yes", "tsx", "scripts/test-live-scraper.ts"], {
  cwd: appDir,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
