/**
 * cPanel / Plesk / Phusion Passenger / PM2 Direct Startup Entrypoint
 *
 * Ensures process.cwd() always points to the uploaded app folder before loading
 * dist/server.cjs so .env, dist/, and data/ resolve reliably on every hosting panel.
 */
const fs = require("fs");
const path = require("path");

// Always anchor working directory to this project root (critical for cPanel Passenger)
process.chdir(__dirname);
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const distServer = path.resolve(__dirname, "dist", "server.cjs");
const prebuiltServer = path.resolve(__dirname, "prebuilt", "server.cjs");
const hasDist = fs.existsSync(distServer);
const hasPrebuilt = fs.existsSync(prebuiltServer);

let serverBundle = hasDist ? distServer : prebuiltServer;
if (hasDist && hasPrebuilt) {
  try {
    const distTime = fs.statSync(distServer).mtimeMs;
    const prebuiltTime = fs.statSync(prebuiltServer).mtimeMs;
    serverBundle = prebuiltTime > distTime ? prebuiltServer : distServer;
  } catch {
    serverBundle = distServer;
  }
}

if (!fs.existsSync(serverBundle)) {
  console.error(
    "[Installer] Production build not found at dist/server.cjs or prebuilt/server.cjs.\n" +
      "Please run `npm install && npm run build` before starting app.cjs."
  );
  process.exit(1);
}

require(serverBundle);
