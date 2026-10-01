import { useRouter } from "expo-router";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";

const chaplets = [
  {
    id: "1", title: "Divine Mercy Chaplet",
    beads: "5 decades", duration: "20 mins",
    desc: "Pray on ordinary Rosary beads. Begin with Our Father, Hail Mary, and Apostles' Creed.",
  },
  {
    id: "2", title: "Chaplet of St. Michael",
    beads: "9 salutations", duration: "15 mins",
    desc: "Honour the nine choirs of angels and seek the protection of St. Michael the Archangel.",
  },
  {
    id: "3", title: "Chaplet of the Immaculate Heart",
    beads: "3 groups", duration: "10 mins",
    desc: "A devotion to our Blessed Mother's most pure and sorrowful heart.",
  },
  {
    id: "4", title: "Seven Sorrows Chaplet",
    beads: "7 decades", duration: "25 mins",
    desc: "Meditate on the seven sorrows of the Blessed Virgin Mary.",
  },
  {
    id: "5", title: "Chaplet of St. Joseph",
    beads: "3 groups", duration: "12 mins",
    desc: "Seek the intercession of St. Joseph, patron of the Universal Church.",
  },
];

// Chaplets with full text in app/chaplet/[id].tsx
const AVAILABLE = new Set(["1"]);

export default function ChapletsScreen() {
  const router = useRouter();
  const sorted = [...chaplets].sort(
    (a, b) => Number(AVAILABLE.has(b.id)) - Number(AVAILABLE.has(a.id))
  );

  return (
    <Page>
      <PageHeader back title="Chaplets" description="Meditative bead prayers" />

      <Alert>
        Chaplets are shorter bead prayers focused on a particular devotion or mystery.
      </Alert>

      <Section title="All chaplets" count={chaplets.length}>
        <ListCard
          items={sorted.map((chaplet) => ({
            key: chaplet.id,
            title: chaplet.title,
            description: chaplet.desc,
            meta: `${chaplet.beads} · ${chaplet.duration}`,
            ...(AVAILABLE.has(chaplet.id)
              ? { onPress: () => router.push(`/chaplet/${chaplet.id}`) }
              : { unavailableLabel: "Coming soon" }),
          }))}
        />
      </Section>
    </Page>
  );
}
