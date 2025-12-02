import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "Logistic Management System",
        short_name: "LogisticApp",
        description: "Aplikasi manajemen logistik dengan kemampuan offline",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico,jpg,jpeg,webp,woff2,ttf,eot}",
        ],
        runtimeCaching: [
          // Cache gambar dari Supabase untuk offline access
          {
            urlPattern:
              /^https:\/\/ispttoyjzbfafmiuhkeu\.supabase\.co\/.*\.(png|jpg|jpeg|webp|gif|svg)/,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache API responses
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 jam
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache manifest dan assets
          {
            urlPattern: /^https:\/\/.*\.(js|css|html)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        type: "module",
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@supabase/supabase-js", "lucide-react"],
  },
});
