// Shared by the payment scripts: reads the ObPay settings from .env.local
// (never committed) without printing them.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROJECT_REF = "mwleayefcrmtzhqymlvf";

export function readEnv() {
  const file = path.join(ROOT, ".env.local");
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  for (const name of ["OBPAY_SECRET_KEY", "OBPAY_WEBHOOK_SECRET"]) {
    if (!values[name]) throw new Error(`Add ${name}=... to .env.local first (ObPay Dashboard → API Keys)`);
  }
  return values;
}
