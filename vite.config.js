import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.KEY': JSON.stringify(env.KEY),
      'process.env.IV': JSON.stringify(env.IV),
    },
    plugins: [react()],
    build: {
      outDir: "build",
      emptyOutDir: true,
    },

    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
    }
  }
})
