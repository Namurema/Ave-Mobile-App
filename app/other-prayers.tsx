import { useRouter } from "expo-router";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";

const categories = [
  {
    id: "marian",
    title: "Marian Prayers",
    prayers: [
      { id: "m1", title: "The Angelus", duration: "3 mins" },
      { id: "m2", title: "Regina Caeli", duration: "2 mins" },
      { id: "m3", title: "Memorare", duration: "2 mins" },
      { id: "m4", title: "Salve Regina", duration: "2 mins" },
    ],
  },
  {
    id: "traditional",
    title: "Traditional Prayers",
    prayers: [
      { id: "t1", title: "Act of Contrition", duration: "2 mins" },
      { id: "t2", title: "Act of Faith", duration: "2 mins" },
      { id: "t3", title: "Act of Hope", duration: "2 mins" },
      { id: "t4", title: "Act of Love", duration: "2 mins" },
    ],
  },
  {
    id: "saints",
    title: "Prayers to Saints",
    prayers: [
      { id: "s1", title: "St. Michael the Archangel", duration: "2 mins" },
      { id: "s2", title: "Prayer to Guardian Angel", duration: "2 mins" },
      { id: "s3", title: "Prayer to St. Francis", duration: "3 mins" },
      { id: "s4", title: "Litany of the Saints", duration: "8 mins" },
    ],
  },
  {
    id: "eucharistic",
    title: "Eucharistic Prayers",
    prayers: [
      { id: "e1", title: "Anima Christi", duration: "2 mins" },
      { id: "e2", title: "Prayer before Communion", duration: "2 mins" },
      { id: "e3", title: "Prayer after Communion", duration: "3 mins" },
      { id: "e4", title: "Spiritual Communion", duration: "2 mins" },
    ],
  },
  {
    id: "apparitions",
    title: "Marian Apparitions",
    prayers: [
      { id: "guadalupe", title: "Our Lady of Guadalupe", duration: "3 mins" },
      { id: "fatima", title: "Our Lady of Fatima Novena", duration: "3 mins" },
      { id: "magnificat", title: "Magnificat", duration: "2 mins" },
    ],
  },
];

// Prayers with full text in app/other-prayer/[id].tsx
const AVAILABLE = new Set(["guadalupe", "fatima", "magnificat"]);

const availableCount = (category: (typeof categories)[number]) =>
  category.prayers.filter((p) => AVAILABLE.has(p.id)).length;

export default function OtherPrayersScreen() {
  const router = useRouter();
  // Categories with readable prayers first
  const sorted = [...categories].sort((a, b) => availableCount(b) - availableCount(a));

  return (
    <Page>
      <PageHeader back title="Other Prayers" description="Sacred prayers from Catholic tradition" />

      {sorted.map((category) => (
        <Section key={category.id} title={category.title}>
          <ListCard
            items={category.prayers.map((prayer) => ({
              key: prayer.id,
              title: prayer.title,
              description: prayer.duration,
              ...(AVAILABLE.has(prayer.id)
                ? { onPress: () => router.push(`/other-prayer/${prayer.id}`) }
                : { unavailableLabel: "Coming soon" }),
            }))}
          />
        </Section>
      ))}
    </Page>
  );
}
