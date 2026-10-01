import { useLocalSearchParams } from "expo-router";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";

const novenaContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  audioUrl?: string;
  sections: { heading: string; body: string }[];
}> = {
  "7": {
    title: "Novena to the 13 Blessed Souls",
    subtitle: "Jesus & His 12 Apostles — 13 consecutive days",
    icon: "",
    color: "#5C2D7C",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/novena-13-blessed-souls.mp3",
    sections: [
      {
        heading: "Opening Prayer (Read Twice)",
        body: "Oh my 13 Blessed souls so wise and understanding, I ask you for the Love of God that my request be answered.\n\nOh my 13 Blessed souls so wise and understanding, I ask you for the Love of God that my request be answered.\n\nOf you I ask for the sake of the blood that Jesus shed that my request be answered.",
      },
      {
        heading: "Prayer to Our Lord",
        body: "My Lord Jesus Christ that your protection wrap me with your arms. Guard me with your eyes. O God of kindness you have been my defender in life and death. I ask that you free me from the difficulties that torment me.",
      },
      {
        heading: "Closing Prayer",
        body: "My 13 blessed souls so wise and understanding having received the grace I seek from you (state your request) I will be devoted to you.",
      },
      {
        heading: "Instruction",
        body: "Say 13 Our Father's and 13 Hail Mary's for 13 consecutive days.",
      },
    ],
  },
};

export default function NovenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const novena = novenaContent[id ?? ""];

  if (!novena) {
    return (
      <Page width="narrow">
        <PageHeader back title="Novena not found" description="It may not be available yet." />
      </Page>
    );
  }

  return (
    <Page width="narrow">
      <PageHeader back eyebrow="Novena" title={novena.title} description={novena.subtitle} />

      {AUDIO_ENABLED && novena.audioUrl && <AudioPlayer url={novena.audioUrl} color={novena.color} />}

      <ReadingCard sections={novena.sections} />
    </Page>
  );
}
