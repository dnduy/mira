import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    // Pre-bundle heavy deps — giảm thời gian khởi động dev server
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "zmp-ui", "zmp-sdk/apis", "zustand", "axios", "dayjs"],
    },
    server: {
      // Warm up các file hay dùng nhất — trang chủ + booking load nhanh hơn
      warmup: {
        clientFiles: [
          "./app.jsx",
          "./pages/home/index.jsx",
          "./pages/booking/index.jsx",
          "./components/HotelCard.jsx",
        ],
      },
    },
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
