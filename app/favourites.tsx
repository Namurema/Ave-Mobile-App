import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUserDataStore } from "../store/userDataStore";
import { useContent } from "../lib/i18n/content";
import { describeItem } from "../lib/items";
import { Page, PageHeader, Section, ListCard, EmptyState } from "../components/ui/page";

export default function FavouritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const favourites = useUserDataStore((state) => state.favourites);

  const items = favourites
    .map((key) => ({ key, info: describeItem(key, t, tc) }))
    .filter((item) => item.info)
    .map(({ key, info }) => ({
      key,
      title: info!.title,
      meta: info!.kind,
      onPress: () => router.push(info!.route as any),
    }));

  return (
    <Page>
      <PageHeader title={t("favourites.title")} description={t("favourites.description")} />
      {items.length === 0 ? (
        <EmptyState title={t("favourites.title")} description={t("favourites.empty")} />
      ) : (
        <Section title={t("favourites.title")} count={items.length}>
          <ListCard items={items} />
        </Section>
      )}
    </Page>
  );
}
