import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.KEY': JSON.stringify(env.KEY),
      'process.env.IV': JSON.stringify(env.IV),
    },
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
});
