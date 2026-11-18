// Copies the ObPay settings from .env.local to the Supabase payment functions'
// secrets, without printing them. Needs `npx supabase login` once.
//
//   node scripts/set-payment-secrets.mjs [--yes]   (--yes: you have agreed to change production)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PROJECT_REF, readEnv } from "./payments-env.mjs";

const env = readEnv();
const secrets = {
  OBPAY_SECRET_KEY: env.OBPAY_SECRET_KEY,
  OBPAY_WEBHOOK_SECRET: env.OBPAY_WEBHOOK_SECRET,
  SITE_URL: env.SITE_URL || "https://aveprayers.com",
};

const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ave-")), "secrets.env");
try {
  fs.writeFileSync(file, Object.entries(secrets).map(([k, v]) => `${k}=${v}`).join("\n") + "\n", { mode: 0o600 });
  execFileSync("npx", ["supabase", "secrets", "set", "--env-file", file, "--project-ref", PROJECT_REF, ...(process.argv.includes("--yes") ? ["--yes"] : [])], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32",
  });
  console.log(`Set ${Object.keys(secrets).join(", ")}`);
} finally {
  fs.rmSync(path.dirname(file), { recursive: true, force: true });
}
