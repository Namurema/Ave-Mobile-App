import { useRouter } from "expo-router";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";

const novenas = [
  { id: "1", title: "Novena to the Sacred Heart", days: 9, desc: "A powerful 9-day devotion to the love of Christ" },
  { id: "2", title: "Novena to Our Lady of Perpetual Help", days: 9, desc: "Seek the intercession of Our Blessed Mother" },
  { id: "3", title: "Novena to St. Joseph", days: 9, desc: "Patron of workers, families and the Universal Church" },
  { id: "4", title: "Novena to the Holy Spirit", days: 9, desc: "Prepare your heart for the gifts of the Spirit" },
  { id: "5", title: "Divine Mercy Novena", days: 9, desc: "Trust in the ocean of Divine Mercy" },
  { id: "6", title: "Novena to St. Jude", days: 9, desc: "Patron saint of desperate cases and lost causes" },
  { id: "7", title: "Novena to the 13 Blessed Souls", days: 13, desc: "Jesus and His 12 Apostles — pray for 13 consecutive days" },
];

// Novenas with full text in app/novena/[id].tsx
const AVAILABLE = new Set(["7"]);

export default function NovenasScreen() {
  const router = useRouter();
  const sorted = [...novenas].sort(
    (a, b) => Number(AVAILABLE.has(b.id)) - Number(AVAILABLE.has(a.id))
  );

  return (
    <Page>
      <PageHeader back title="Novenas" description="9 days of devoted prayer" />

      <Alert>
        A novena is a prayer said over 9 consecutive days, asking for a special grace or favour.
      </Alert>

      <Section title="Available novenas">
        <ListCard
          items={sorted.map((novena) => ({
            key: novena.id,
            title: novena.title,
            description: novena.desc,
            meta: `${novena.days} days`,
            ...(AVAILABLE.has(novena.id)
              ? { onPress: () => router.push(`/novena/${novena.id}`) }
              : { unavailableLabel: "Coming soon" }),
          }))}
        />
      </Section>
    </Page>
  );
}
