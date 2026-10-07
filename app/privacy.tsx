import { useTranslation } from "react-i18next";
import { Page, PageHeader, ReadingCard } from "../components/ui/page";
import { privacyPolicy, LEGAL_UPDATED } from "../constants/legal";

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  return (
    <Page sidebar={false}>
      <PageHeader back title={t("legal.privacy")} description={`${t("legal.updated")}: ${LEGAL_UPDATED}${i18n.language === "en" ? "" : `. ${t("legal.englishOnly")}`}`} />
      <ReadingCard sections={privacyPolicy} />
    </Page>
  );
}
