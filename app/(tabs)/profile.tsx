import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Footer from "../../components/ui/Footer";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/LanguageStore";

const settingsItems = [
  { id: "premium", icon: "👑", title: "Premium Subscription", badge: "Pro", arrow: true },
  { id: "privacy", icon: "🔒", title: "Privacy & Security", arrow: true },
  { id: "audio", icon: "🎧", title: "Audio Preferences", arrow: true },
  { id: "support", icon: "💬", title: "Contact Support", arrow: true },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, session, signIn, signOut, loadSession } = useAuthStore();
  const { language } = useLanguageStore();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Guest User';
  const isSignedIn = !!session;

  const languageLabels: Record<string, string> = {
    en: '🇬🇧 English',
    lg: '🇺🇬 Oluganda',
    rny: '🇺🇬 Orunyankore',
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-10">
        <View className="flex-row items-center justify-between mb-8">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-lg">🕊️</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/Language')}
            className="bg-white/20 rounded-full px-4 py-2 flex-row items-center gap-2"
          >
            <Text className="text-white text-sm font-medium">
              {languageLabels[language] ?? '🇬🇧 English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View className="items-center">
          <View className="relative mb-3">
            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
              <Text className="text-4xl">{isSignedIn ? '😇' : '👤'}</Text>
            </View>
            <View className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-primary ${isSignedIn ? 'bg-green-400' : 'bg-gray-400'}`} />
          </View>
          <Text className="text-white text-xl font-bold">{displayName}</Text>

          {!isSignedIn ? (
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={signingIn}
              className="mt-2 bg-white/20 rounded-full px-4 py-1 flex-row items-center gap-2"
            >
              {signingIn ? (
                <ActivityIndicator size="small" color="#C2FFFF" />
              ) : (
                <Text className="text-accent text-sm">Sign in with Google →</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text className="text-accent text-sm mt-1">{user?.email}</Text>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Account Settings */}
        <View className="px-6 mt-6">
          <Text className="text-gray-800 font-bold text-base mb-3">
            Account Settings
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-4 py-4 ${
                  index < settingsItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-9 h-9 bg-accent rounded-full items-center justify-center mr-3">
                  <Text className="text-lg">{item.icon}</Text>
                </View>
                <Text className="flex-1 text-gray-800 font-medium">{item.title}</Text>
                {item.badge && (
                  <View className="bg-primary rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-white text-xs font-semibold">{item.badge}</Text>
                  </View>
                )}
                {item.arrow && (
                  <Text className="text-gray-300 text-lg">›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out — only show if signed in */}
        {isSignedIn && (
          <View className="px-6 mt-4 mb-10">
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
            >
              <View className="w-9 h-9 bg-red-50 rounded-full items-center justify-center mr-3">
                <Text className="text-lg">🚪</Text>
              </View>
              <Text className="text-red-400 font-medium flex-1">Sign Out</Text>
              <Text className="text-gray-300 text-lg">›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mb-10" />
      </ScrollView>

      <Footer />
    </View>
  );
}