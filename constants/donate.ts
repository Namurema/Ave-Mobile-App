// Donations through Airtel Money, to keep Ave running. Donations stay hidden
// until the merchant code is filled in.
export const DONATE = {
  // Airtel Money merchant code, e.g. "1234567"
  airtelCode: "",
  // The name Airtel shows before you confirm with your PIN
  airtelName: "",
};

export const DONATIONS_ENABLED = !!DONATE.airtelCode;

// Ask after this many different days of using Ave, then at most once a month
export const DONATE_AFTER_DAYS = 5;
