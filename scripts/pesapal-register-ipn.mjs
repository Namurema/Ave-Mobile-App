// Registers Ave's payment-notification address with PesaPal (once per
// environment) and prints its IPN id. Add the id to .env.local as
// PESAPAL_IPN_ID, then run scripts/set-payment-secrets.mjs.
//
//   node scripts/pesapal-register-ipn.mjs
import { IPN_URL, pesapalBase, readEnv } from "./payments-env.mjs";

const env = readEnv();
const base = pesapalBase(env.PESAPAL_ENV);

const call = async (path, init = {}) => {
  const response = await fetch(base + path, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) throw new Error(`${path}: ${response.status} ${JSON.stringify(body?.error ?? body)}`);
  return body;
};

const { token } = await call("/api/Auth/RequestToken", {
  method: "POST",
  body: JSON.stringify({ consumer_key: env.PESAPAL_CONSUMER_KEY, consumer_secret: env.PESAPAL_CONSUMER_SECRET }),
});
const auth = { Authorization: `Bearer ${token}` };

// Reuse the registration if this address is already known
const existing = (await call("/api/URLSetup/GetIpnList", { headers: auth })) ?? [];
let ipn = (Array.isArray(existing) ? existing : []).find((item) => item.url === IPN_URL);
if (!ipn) {
  ipn = await call("/api/URLSetup/RegisterIPN", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ url: IPN_URL, ipn_notification_type: "POST" }),
  });
}
console.log(`PesaPal (${env.PESAPAL_ENV}) IPN for ${IPN_URL}`);
console.log(`PESAPAL_IPN_ID=${ipn.ipn_id}`);
