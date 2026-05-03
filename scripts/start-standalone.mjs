import { existsSync, cpSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const standaloneDir = join(process.cwd(), ".next", "standalone");
const standaloneServer = join(standaloneDir, "server.js");
const sourceStatic = join(process.cwd(), ".next", "static");
const targetStatic = join(standaloneDir, ".next", "static");
const sourcePublic = join(process.cwd(), "public");
const targetPublic = join(standaloneDir, "public");

if (!existsSync(standaloneServer)) {
  console.error("Missing .next/standalone/server.js. Run npm run build before npm start.");
  process.exit(1);
}

if (existsSync(sourceStatic)) {
  rmSync(targetStatic, { recursive: true, force: true });
  cpSync(sourceStatic, targetStatic, { recursive: true });
}

if (existsSync(sourcePublic)) {
  rmSync(targetPublic, { recursive: true, force: true });
  cpSync(sourcePublic, targetPublic, { recursive: true });
}

const child = spawn(process.execPath, [standaloneServer], {
  cwd: standaloneDir,
  env: process.env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
