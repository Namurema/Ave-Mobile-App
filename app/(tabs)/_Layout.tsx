import { Tabs } from "expo-router";
import { Text, Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarActiveTintColor: "#007C7C",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: "Prayers",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>📖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="rosary"
        options={{
          title: "Rosary",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>📿</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}