import { useTranslation } from "react-i18next";
import { Page, PageHeader, ReadingCard } from "../components/ui/page";
import { termsAndConditions, LEGAL_UPDATED } from "../constants/legal";

export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  return (
    <Page sidebar={false}>
      <PageHeader back title={t("legal.terms")} description={`${t("legal.updated")}: ${LEGAL_UPDATED}${i18n.language === "en" ? "" : `. ${t("legal.englishOnly")}`}`} />
      <ReadingCard sections={termsAndConditions} />
    </Page>
  );
}
