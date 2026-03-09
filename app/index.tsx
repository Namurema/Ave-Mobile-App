import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getCategories } from '../lib/supabase/queries';

export default function HomeScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then((data) => {
        console.log('Categories:', data);
        setCategories(data);
      })
      .catch((e) => {
        console.log('Error:', e.message);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-navy-900">
      <ActivityIndicator color="#c9a84c" size="large" />
      <Text className="text-white mt-4">Loading...</Text>
    </View>
  );

  return (
    <View className="flex-1 items-center justify-center bg-navy-900 px-6">
      <Text className="text-gold-500 text-2xl font-bold mb-6">🙏 Ave</Text>
      {error && <Text className="text-red-400 mb-4">{error}</Text>}
      {categories.length === 0 && !error && (
        <Text className="text-white opacity-60">No categories found</Text>
      )}
      {categories.map((cat) => (
        <Text key={cat.id} className="text-white text-base mb-2">
          {cat.name}
        </Text>
      ))}
    </View>
  );
}