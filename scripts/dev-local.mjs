import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const localDatabaseUrl = "postgresql://postgres:postgres@localhost:5433/controle_geral_api_test?schema=public";
const isWindows = process.platform === "win32";
const dockerComposeFile = "docker-compose.test.yml";

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: localDatabaseUrl,
  DIRECT_DATABASE_URL: localDatabaseUrl,
};

function bin(name) {
  const executable = isWindows ? `${name}.cmd` : name;
  const path = join(process.cwd(), "node_modules", ".bin", executable);

  return existsSync(path) ? path : executable;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: "inherit",
      shell: isWindows,
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${signal ?? code}`));
    });
  });
}

console.log("Using local DATABASE_URL at localhost:5433 for dev:local.");
await run("docker", ["compose", "-f", dockerComposeFile, "up", "-d"]);
await run(bin("prisma"), ["generate"]);
await run(bin("prisma"), ["migrate", "deploy"]);

if (process.env.DEV_LOCAL_SKIP_SERVER !== "1") {
  await run(bin("tsx"), ["watch", "src/server.ts"]);
}
