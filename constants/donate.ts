// Donations through Airtel Money, to keep Ave running. Donations stay hidden
// until the merchant code is filled in.
export const DONATE = {
  // Airtel Money merchant code, e.g. "1234567"
  airtelCode: "7227076",
  // The name Airtel shows before you confirm with your PIN
  airtelName: "Stylist by STL",
};

export const DONATIONS_ENABLED = !!DONATE.airtelCode;

// Ask after this many different days of using Ave, then at most once a month
export const DONATE_AFTER_DAYS = 5;
