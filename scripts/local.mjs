import fs from "node:fs";
import { spawn } from "node:child_process";
import dotenv from "dotenv";

// Never inherit the production .env database when exercising local workflows.
const env = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(".local/development.env")),
};
for (const name of ["DATABASE_URL", "DIRECT_URL", "TEST_DATABASE_URL"]) {
  if (
    !env[name] ||
    !["127.0.0.1", "localhost", "[::1]"].includes(new URL(env[name]).hostname)
  ) {
    throw new Error(`${name} must point to an isolated loopback database.`);
  }
}
if (env.FLORINS_ENV !== "development")
  throw new Error("Local development mode is required.");
const origin = new URL(env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000");
if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname))
  throw new Error("Local site origin must use loopback.");
origin.hostname = "127.0.0.1";
env.NEXT_PUBLIC_SITE_URL = origin.origin;
env.SITE_ORIGIN = origin.origin;
// Both names refer to this same loopback preview. Keep the allowlist explicit
// and server-only; production commands do not set it.
env.LOCAL_PREVIEW_ORIGINS = ["localhost", "127.0.0.1"]
  .map((hostname) => {
    const alias = new URL(origin);
    alias.hostname = hostname;
    return alias.origin;
  })
  .join(",");
const routes = {
  dev: ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1"],
  start: [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
  ],
  migrate: ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  seed: ["node_modules/prisma/build/index.js", "db", "seed"],
  test: [
    "--conditions=react-server",
    "--import",
    "tsx",
    "scripts/verify-stage6.ts",
  ],
};
const args = routes[process.argv[2]];
if (!args) throw new Error("Choose dev, start, migrate, seed or test.");
const child = spawn(process.execPath, [...args, ...process.argv.slice(3)], {
  env,
  stdio: "inherit",
  windowsHide: true,
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
child.on("error", () => {
  console.error("Local command could not start.");
  process.exitCode = 1;
});
