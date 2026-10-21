// Copies the PesaPal settings from .env.local to the Supabase payment
// functions' secrets, without printing them. Needs `npx supabase login` once.
//
//   node scripts/set-payment-secrets.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PROJECT_REF, readEnv } from "./payments-env.mjs";

const env = readEnv();
if (!env.PESAPAL_IPN_ID) throw new Error("Add PESAPAL_IPN_ID=... to .env.local (from scripts/pesapal-register-ipn.mjs)");

const secrets = {
  PESAPAL_CONSUMER_KEY: env.PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET: env.PESAPAL_CONSUMER_SECRET,
  PESAPAL_ENV: env.PESAPAL_ENV,
  PESAPAL_IPN_ID: env.PESAPAL_IPN_ID,
  SITE_URL: env.SITE_URL || "https://ave-prayers.vercel.app",
};

const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ave-")), "secrets.env");
try {
  fs.writeFileSync(file, Object.entries(secrets).map(([k, v]) => `${k}=${v}`).join("\n") + "\n", { mode: 0o600 });
  execFileSync("npx", ["supabase", "secrets", "set", "--env-file", file, "--project-ref", PROJECT_REF], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32",
  });
  console.log(`Set ${Object.keys(secrets).join(", ")} (PesaPal ${env.PESAPAL_ENV})`);
} finally {
  fs.rmSync(path.dirname(file), { recursive: true, force: true });
}
