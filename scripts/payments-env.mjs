// Shared by the payment scripts: reads PesaPal settings from .env.local
// (never committed) without printing them.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROJECT_REF = "mwleayefcrmtzhqymlvf";
export const IPN_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/pesapal-ipn`;

export function readEnv() {
  const file = path.join(ROOT, ".env.local");
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  // --live: use the live keys (PESAPAL_LIVE_CONSUMER_KEY/SECRET) on PesaPal's live server
  if (process.argv.includes("--live")) {
    values.PESAPAL_CONSUMER_KEY = values.PESAPAL_LIVE_CONSUMER_KEY;
    values.PESAPAL_CONSUMER_SECRET = values.PESAPAL_LIVE_CONSUMER_SECRET;
    values.PESAPAL_IPN_ID = values.PESAPAL_LIVE_IPN_ID;
    values.PESAPAL_ENV = "live";
  }
  // --ipn-id=...: the id printed by pesapal-register-ipn.mjs (not secret)
  const ipnArg = process.argv.find((arg) => arg.startsWith("--ipn-id="));
  if (ipnArg) values.PESAPAL_IPN_ID = ipnArg.slice("--ipn-id=".length);
  for (const name of ["PESAPAL_CONSUMER_KEY", "PESAPAL_CONSUMER_SECRET"]) {
    if (!values[name]) throw new Error(`Add ${name}=... to .env.local first`);
  }
  values.PESAPAL_ENV = values.PESAPAL_ENV === "live" ? "live" : "sandbox";
  return values;
}

export const pesapalBase = (env) =>
  env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";
