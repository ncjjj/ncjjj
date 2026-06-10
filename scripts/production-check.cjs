const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("1/4 Validating environment...");
run("npm", ["run", "validate:env"]);

console.log("2/4 Running smoke tests...");
run("npm", ["run", "test"]);

console.log("3/4 Building production bundle...");
run("npm", ["run", "build"]);

console.log("4/4 Checking database schema (optional)...");
const dbCheck = spawnSync("npm", ["run", "db:check"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (dbCheck.status !== 0) {
  console.warn("Database check failed. Run `npm run db:migrate` before deploying.");
  process.exit(dbCheck.status || 1);
}

console.log("Production checks passed.");
