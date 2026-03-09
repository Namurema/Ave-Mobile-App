import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#1a1a2e" },
        tabBarActiveTintColor: "#c9a84c",
        tabBarInactiveTintColor: "#888",
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#c9a84c",
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="rosary" options={{ title: "Rosary" }} />
      <Tabs.Screen name="prayers" options={{ title: "Prayers" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}