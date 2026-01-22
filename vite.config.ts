import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.DASHSCOPE_API_KEY': JSON.stringify(env.DASHSCOPE_API_KEY || env.API_KEY),
      'process.env.DASHSCOPE_MODEL': JSON.stringify(env.DASHSCOPE_MODEL || 'qwen3-max'),
    },
    server: {
      host: '0.0.0.0', // Ensure it listens on all interfaces
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001', // Use IP instead of localhost
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});