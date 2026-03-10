import { View, Text, TouchableOpacity } from "react-native";
import { useAudioStore } from "../../store/audioStore";

interface AudioPlayerProps {
  url?: string;
  color?: string;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ url, color = "#007C7C" }: AudioPlayerProps) {
  const { isPlaying, duration, position, loadAndPlay, togglePlayPause, seek, currentTrackUrl } =
    useAudioStore();

  const isCurrentTrack = currentTrackUrl === url;

  const handlePlay = async () => {
    if (!url) return;
    if (isCurrentTrack) {
      await togglePlayPause();
    } else {
      await loadAndPlay(url);
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View className="bg-white/10 rounded-2xl p-4">
      {/* Progress Bar */}
      <View className="mb-2">
        <View className="h-1.5 bg-white/20 rounded-full">
          <View
            className="h-1.5 rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: color === "#007C7C" ? "#C2FFFF" : "white",
            }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-white/60 text-xs">
            {isCurrentTrack ? formatTime(position) : "0:00"}
          </Text>
          <Text className="text-white/60 text-xs">
            {isCurrentTrack ? formatTime(duration) : "--:--"}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-8">
        <TouchableOpacity onPress={() => seek(Math.max(0, position - 10000))}>
          <Text className="text-white/70 text-2xl">⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlay}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Text className="text-white text-xl">
            {isCurrentTrack && isPlaying ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seek(Math.min(duration, position + 10000))}>
          <Text className="text-white/70 text-2xl">⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}