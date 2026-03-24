import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // Tách vendor chunks — React, ZMP SDK cache lâu hơn vì ít thay đổi
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-zmp": ["zmp-sdk", "zmp-ui"],
            "vendor-router": ["react-router-dom"],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
