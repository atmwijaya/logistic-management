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
      injectRegister: "auto",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Logistic Management System",
        short_name: "LogisticApp",
        description: "Aplikasi manajemen logistik dengan kemampuan offline",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,jpg,jpeg,webp,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\/.*/,
          /^\/_supabase\/.*/,
          /^\/__\/auth\/.*/,
        ],
        
        additionalManifestEntries: [
          { url: "/", revision: "1.0.0" },
          { url: "/api/katalog", revision: "1.0.0" },
          { url: "/api/peminjaman", revision: "1.0.0" },
          { url: "/api/riwayat", revision: "1.0.0" },
          { url: "/api/contact", revision: "1.0.0" },
          { url: "/api/faq", revision: "1.0.0" },
        ],
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/katalog.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-katalog-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/peminjaman.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-peminjaman-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/riwayat.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-riwayat-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/contact.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-contact-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/api\/faq.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-faq-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/ispttoyjzbfafmiuhkeu\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/ispttoyjzbfafmiuhkeu\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|woff2)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/logistic-backend-nu\.vercel\.app\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "backend-fallback-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 6, // 6 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});