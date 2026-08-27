import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Render React Native primitives in the browser via RNW.
      'react-native': 'react-native-web',
    },
  },
  server: {
    port: 1453,
  },
});
