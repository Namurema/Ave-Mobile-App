// Sets up prayer reminders (web push). Safe to run again.
//
//   node scripts/reminders-setup.mjs            keys + app config + schedule SQL
//   node scripts/reminders-setup.mjs --secrets  also copies the secrets to Supabase
//                                               (needs `npx supabase login` once)
//
// 1. Creates the VAPID key pair and the schedule secret once, in .env.local
//    (never committed; the private key is never printed).
// 2. Writes the public key to constants/reminders.ts (public by design).
// 3. Writes supabase/setup/reminders-cron.local.sql (not committed: it holds
//    the schedule secret) to paste into the Supabase SQL Editor.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { PROJECT_REF, ROOT } from "./payments-env.mjs";

const ENV_FILE = path.join(ROOT, ".env.local");
const SUBJECT = "mailto:stelarlabs@gmail.com";

const readEnv = () => {
  const values = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return values;
};

let env = readEnv();
const additions = [];
if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
  const output = execFileSync("npx", ["--yes", "web-push", "generate-vapid-keys", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    shell: process.platform === "win32",
  });
  const keys = JSON.parse(output.slice(output.indexOf("{")));
  additions.push(`VAPID_PUBLIC_KEY=${keys.publicKey}`, `VAPID_PRIVATE_KEY=${keys.privateKey}`);
}
if (!env.REMINDERS_CRON_SECRET) additions.push(`REMINDERS_CRON_SECRET=${crypto.randomBytes(24).toString("hex")}`);
if (additions.length) {
  fs.appendFileSync(ENV_FILE, `\n# Prayer reminders (scripts/reminders-setup.mjs)\n${additions.join("\n")}\n`);
  env = readEnv();
  console.log(`Added ${additions.map((line) => line.split("=")[0]).join(", ")} to .env.local`);
}

fs.writeFileSync(
  path.join(ROOT, "constants", "reminders.ts"),
  `// Public key for prayer reminders (web push). Written by
// scripts/reminders-setup.mjs; the private key stays on the server.
export const VAPID_PUBLIC_KEY = "${env.VAPID_PUBLIC_KEY}";
`
);
console.log("Wrote constants/reminders.ts");

const sqlDir = path.join(ROOT, "supabase", "setup");
fs.mkdirSync(sqlDir, { recursive: true });
fs.writeFileSync(
  path.join(sqlDir, "reminders-cron.local.sql"),
  `-- Runs the reminder sender every 5 minutes. Paste into the Supabase SQL Editor
-- once, after deploying the send-reminders function. Holds a secret: not
-- committed (see .gitignore).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'ave-send-reminders';

select cron.schedule(
  'ave-send-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://${PROJECT_REF}.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '${env.REMINDERS_CRON_SECRET}'),
    body := '{}'::jsonb
  );
  $$
);
`
);
console.log("Wrote supabase/setup/reminders-cron.local.sql");

if (process.argv.includes("--secrets")) {
  const secrets = {
    VAPID_PUBLIC_KEY: env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: SUBJECT,
    REMINDERS_CRON_SECRET: env.REMINDERS_CRON_SECRET,
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ave-"));
  const file = path.join(dir, "secrets.env");
  try {
    fs.writeFileSync(file, Object.entries(secrets).map(([k, v]) => `${k}=${v}`).join("\n") + "\n", { mode: 0o600 });
    execFileSync("npx", ["supabase", "secrets", "set", "--env-file", file, "--project-ref", PROJECT_REF], {
      stdio: ["ignore", "ignore", "inherit"],
      shell: process.platform === "win32",
    });
    console.log(`Set ${Object.keys(secrets).join(", ")} on Supabase`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
