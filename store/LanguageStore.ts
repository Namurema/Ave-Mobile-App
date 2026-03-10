import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import i18n from '../lib/i18n';

const storage = createMMKV({ id: 'language-store' });

interface LanguageState {
  language: string;
  setLanguage: (code: string) => void;
  loadLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  loadLanguage: () => {
    const saved = storage.getString('language');
    if (saved) {
      i18n.changeLanguage(saved);
      set({ language: saved });
    }
  },

  setLanguage: (code: string) => {
    storage.set('language', code);
    i18n.changeLanguage(code);
    set({ language: code });
  },
}));