import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../lib/i18n';

const LANGUAGE_KEY = 'language';

interface LanguageState {
  language: string;
  setLanguage: (code: string) => void;
  loadLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) {
      i18n.changeLanguage(saved);
      set({ language: saved });
    }
  },

  setLanguage: async (code: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    i18n.changeLanguage(code);
    set({ language: code });
  },
}));