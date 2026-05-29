import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': 'http://localhost:8081',
        },
        fs: {
          allow: ['.']
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-router': ['react-router-dom'],
              'vendor-genai': ['@google/genai'],
              'vendor-oauth': ['@react-oauth/google'],
              'vendor-icons': ['react-icons', 'lucide-react'],
              'vendor-hls': ['hls.js'],
              'vendor-player': ['react-player']
            }
          }
        },
        chunkSizeWarningLimit: 800,
        sourcemap: false
      }
    };
});
