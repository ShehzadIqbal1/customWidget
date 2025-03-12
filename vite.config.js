import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [react()],
    server: {
      host: true, // Allows external access
      port: 8301,
      allowedHosts: ["45354bbd26a5.apps-tunnel.monday.app"], // Whitelist the host
    },
  };
});

