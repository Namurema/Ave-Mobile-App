import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getCategories } from '../lib/supabase/queries';

export default function HomeScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-navy-900">
      <ActivityIndicator color="#c9a84c" />
    </View>
  );

  if (error) return (
    <View className="flex-1 items-center justify-center bg-navy-900">
      <Text className="text-red-400">{error}</Text>
    </View>
  );

  return (
    <View className="flex-1 items-center justify-center bg-navy-900 px-6">
      <Text className="text-gold-500 text-2xl font-bold mb-6">🙏 Ave</Text>
      {categories.map((cat) => (
        <Text key={cat.id} className="text-white text-base mb-2">
          {cat.name}
        </Text>
      ))}
    </View>
  );
}