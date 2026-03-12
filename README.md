# Ave 
A Catholic prayer companion app for daily prayers, the Rosary, novenas, and spiritual devotion built for Uganda.

## Features
-  Daily Morning, Midday & Night Prayers
-  Daily Rosary with Mysteries
-  Novenas & Chaplets
-  Audio playback for all prayers
- Multilingual: English, Luganda , Runyakole 
-  Google Sign In (native build)

## Tech Stack
- React Native + Expo SDK 54
- Expo Router (file-based navigation)
- NativeWind (Tailwind CSS)
- Supabase (PostgreSQL + Storage + Auth)
- Zustand (state management)
- i18next (translations)
- expo-av (audio)

## Getting Started
```bash
npm install --legacy-peer-deps
npx expo start
```



## Project Structure
```
app/          # Screens (Expo Router)
components/   # Reusable UI components
lib/          # Supabase client, queries, i18n
store/        # Zustand state stores
assets/       # Images, audio files
```
