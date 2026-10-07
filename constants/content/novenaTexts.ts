// Full novena texts, by novena id.
// Translated through the content dictionaries; see scripts/translate.mjs.
export const novenaContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  audioUrl?: string;
  sections: { heading: string; body: string }[];
}> = {
  "2": {
    title: "Novena to Our Lady of Perpetual Help",
    subtitle: "Pray these prayers once a day for 9 days",
    icon: "",
    color: "#01758F",
    sections: [
      {
        heading: "How to Pray This Novena",
        body: "Pray the same prayers each day, for 9 days in a row.",
      },
      {
        heading: "Opening",
        body: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      },
      {
        heading: "Intro Prayer",
        body: "Oh Mother of Perpetual Help, grant that I may ever invoke your powerful name, the protection of the living and the salvation of the dying. Purest Mary, let your name henceforth be ever on my lips. Delay not, Blessed Lady, to rescue me whenever I call on you. In my temptations, in my needs, I will never cease to call on you, ever repeating your sacred name, Mary, Mary.\n\nWhat a consolation, what sweetness, what confidence fills my soul when I utter your sacred name or even only think of you! I thank the Lord for having given you so sweet, so powerful, so lovely a name. But I will not be content with merely uttering your name. Let my love for you prompt me ever to hail you Mother of Perpetual Help. Mother of Perpetual Help, pray for me and grant me the favor I confidently ask of you (mention request here).",
      },
      {
        heading: "Concluding Prayer",
        body: "Hail Mary (three times)",
      },
    ],
  },
  "7": {
    title: "Novena to the 13 Blessed Souls",
    subtitle: "Jesus and His 12 Apostles, over 13 consecutive days",
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
