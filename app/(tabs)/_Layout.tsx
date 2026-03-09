import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#f0f0f0",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#007C7C",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: "Prayers",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📖</Text>,
        }}
      />
      <Tabs.Screen
        name="rosary"
        options={{
          title: "Rosary",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📿</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}