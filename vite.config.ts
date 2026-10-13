import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative assets work both at a GitHub Pages project path and at a root domain.
  base: './',
  plugins: [react()],
});
