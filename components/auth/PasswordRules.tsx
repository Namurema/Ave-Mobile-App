import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

// Password rules for new passwords (sign-up and reset). Sign-in doesn't check
// them, so older passwords keep working.
const RULES = [
  { key: "auth.ruleLength", test: (password: string) => password.length >= 8 },
  { key: "auth.ruleLetter", test: (password: string) => /\p{L}/u.test(password) },
  { key: "auth.ruleNumber", test: (password: string) => /\d/.test(password) },
];

export const isStrongPassword = (password: string) => RULES.every((rule) => rule.test(password));

// Live checklist under a password field: each rule turns teal once met
// (text only, no icons)
export function PasswordRules({ password }: { password: string }) {
  const { t } = useTranslation();
  return (
    <View className="gap-1" aria-live="polite">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <Text key={rule.key} className={cn("text-sm", met ? "font-medium text-primary" : "text-muted-foreground")}>
            {t(rule.key)}
          </Text>
        );
      })}
    </View>
  );
}
