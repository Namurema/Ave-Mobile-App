import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";

const tabs = [
  { label: "Home", icon: "🏠", segment: "home", route: "/(tabs)/home" },
  { label: "Schedule", icon: "📅", segment: "schedule", route: "/(tabs)/home" },
  { label: "Prayers", icon: "📖", segment: "prayers", route: "/(tabs)/prayers" },
  { label: "Settings", icon: "⚙️", segment: "profile", route: "/(tabs)/profile" },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        flexDirection: "row",
        paddingBottom: Platform.OS === "ios" ? 24 : 10,
        paddingTop: 10,
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.segment);
        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => router.push(tab.route as any)}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
            <Text
              style={{
                fontSize: 11,
                marginTop: 2,
                color: isActive ? "#007C7C" : "#9CA3AF",
                fontWeight: isActive ? "600" : "400",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
