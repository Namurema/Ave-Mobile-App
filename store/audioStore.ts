import { create } from 'zustand';
import { Audio } from 'expo-av';

interface AudioState {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  currentTrackUrl: string | null;
  loadAndPlay: (url: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  stop: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  sound: null,
  isPlaying: false,
  duration: 0,
  position: 0,
  currentTrackUrl: null,

  loadAndPlay: async (url: string) => {
    try {
      const { sound: existingSound } = get();

      // Unload previous sound
      if (existingSound) {
        await existingSound.unloadAsync();
      }

      // Set audio mode for background play
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            set({
              isPlaying: status.isPlaying,
              duration: status.durationMillis ?? 0,
              position: status.positionMillis ?? 0,
            });
          }
        }
      );

      set({ sound, isPlaying: true, currentTrackUrl: url });
    } catch (error) {
      console.log('Audio error:', error);
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    set({ isPlaying: !isPlaying });
  },

  seek: async (position: number) => {
    const { sound } = get();
    if (!sound) return;
    await sound.setPositionAsync(position);
  },

  stop: async () => {
    const { sound } = get();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    set({ sound: null, isPlaying: false, position: 0, currentTrackUrl: null });
  },
}));