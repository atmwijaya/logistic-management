import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import UserLayout from "./layout/userLayout";
import AdminLayout from "./layout/adminLayout";
import LoginPage from "./pages/admin/LoginPage";
import PWABadge from "./PWABadge";
import "./index.css";
import { registerSW } from "virtual:pwa-register/react";

// Import image cache manager
import imageCacheManager from "./utils/imageCache";

// Register Service Worker dengan config yang lebih baik
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline.");
    // Pre-cache gambar penting saat offline ready
    preCacheImportantImages();
  },
});

// Function untuk pre-cache gambar penting
const preCacheImportantImages = async () => {
  try {
    // Ambil gambar penting yang sering digunakan
    const importantImages = [
      // Logo atau gambar default aplikasi
      'https://ispttoyjzbfafmiuhkeu.supabase.co/storage/v1/object/public/katalog/images/default-product.png',
      // Tambahkan URL gambar penting lainnya di sini
    ];
    
    await imageCacheManager.preCacheImportantImages(importantImages);
    console.log("Important images pre-cached successfully");
  } catch (error) {
    console.warn("Failed to pre-cache images:", error);
  }
};

// Function untuk handle PWA install prompt
const setupPWAInstall = () => {
  let deferredPrompt;
  let installEventFired = false;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah prompt otomatis
    e.preventDefault();
    deferredPrompt = e;
    
    console.log('BeforeInstallPrompt event fired');
    
    // Dispatch custom event untuk komponen lain
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { deferredPrompt }
    }));
    
    // Auto hide setelah 24 jam jika belum di-install
    if (!installEventFired) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pwa-install-hide'));
      }, 24 * 60 * 60 * 1000);
    }
  });

  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA installed successfully');
    installEventFired = true;
    deferredPrompt = null;
    
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

// Check Service Worker status
const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('Service Worker registered:', registration.scope);
        
        // Cek update setiap 1 jam
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Service Worker check failed:', error);
    }
  }
};

// Setup offline/online event listeners
const setupNetworkListeners = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    
    // Update body classes
    if (isOnline) {
      document.body.classList.remove('offline');
      document.body.classList.add('online');
    } else {
      document.body.classList.remove('online');
      document.body.classList.add('offline');
    }
    
    // Dispatch custom event untuk komponen lain
    window.dispatchEvent(new CustomEvent('network-status-change', {
      detail: { isOnline }
    }));
    
    console.log(`Network status: ${isOnline ? 'Online' : 'Offline'}`);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Set initial status
  updateOnlineStatus();
};

// Setup cache management
const setupCacheManagement = async () => {
  // Cleanup old cache saat startup
  await imageCacheManager.cleanupCache();
  
  // Setup periodic cache cleanup (setiap 7 hari)
  setInterval(async () => {
    await imageCacheManager.cleanupCache();
  }, 7 * 24 * 60 * 60 * 1000);
};

// Initialize PWA features
const initializePWA = async () => {
  console.log('Initializing PWA features...');
  
  try {
    // Setup PWA install
    setupPWAInstall();
    
    // Check Service Worker
    await checkServiceWorker();
    
    // Setup network listeners
    setupNetworkListeners();
    
    // Setup cache management
    await setupCacheManagement();
    
    console.log('PWA initialization complete');
    
    // Dispatch event bahwa PWA siap
    window.dispatchEvent(new CustomEvent('pwa-initialized'));
    
  } catch (error) {
    console.error('PWA initialization failed:', error);
  }
};

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Cek session dari localStorage
      const session = localStorage.getItem("admin_session");
      
      // Validasi session (bisa ditambahkan validasi expiry time)
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          const now = new Date().getTime();
          
          // Cek jika session masih valid (misal: 24 jam)
          if (sessionData.expiry && now < sessionData.expiry) {
            setIsAuthenticated(true);
          } else {
            // Session expired, clear
            localStorage.removeItem("admin_session");
          }
        } catch (e) {
          // Invalid session format
          localStorage.removeItem("admin_session");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memverifikasi autentikasi...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <LoginPage />;
};

// Network Status Indicator Component
const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  useEffect(() => {
    const handleNetworkChange = (e) => {
      const online = e.detail.isOnline;
      setIsOnline(online);
      
      if (!online) {
        // Tampilkan warning saat offline
        setShowOfflineWarning(true);
        
        // Auto hide setelah 5 detik
        setTimeout(() => {
          setShowOfflineWarning(false);
        }, 5000);
      } else {
        setShowOfflineWarning(false);
      }
    };

    window.addEventListener('network-status-change', handleNetworkChange);
    
    return () => {
      window.removeEventListener('network-status-change', handleNetworkChange);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 flex items-center justify-center gap-2 transition-transform duration-300 ${showOfflineWarning ? 'translate-y-0' : '-translate-y-full'}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-sm font-medium">Mode Offline - Menggunakan data cache</span>
    </div>
  );
};

// PWA Install Button Component (Custom)
const PWAInstallButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      setShowButton(true);
    };

    const handleInstallHide = () => {
      setShowButton(false);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
    };

    // Cek apakah sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-hide', handleInstallHide);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-hide', handleInstallHide);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const installEvent = new CustomEvent('trigger-pwa-install');
    window.dispatchEvent(installEvent);
    setShowButton(false);
  };

  if (isInstalled || !showButton) return null;

  return (
    <button
      id="pwa-install-button"
      className="fixed bottom-20 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 hover:shadow-xl transition-all duration-300 animate-pulse-install"
      onClick={handleInstallClick}
      title="Install aplikasi untuk pengalaman yang lebih baik"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-sm font-semibold">Install App</span>
    </button>
  );
};

// PWA Install Handler (terpisah dari button)
const PWAInstallHandler = () => {
  useEffect(() => {
    const handleTriggerInstall = async () => {
      const event = new CustomEvent('get-pwa-deferred-prompt');
      window.dispatchEvent(event);
    };

    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    return () => {
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, []);

  return null;
};

// Main App Content
const AppContent = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen">
      <NetworkStatusIndicator />
      <PWAInstallHandler />
      <PWAInstallButton />
      
      {isLoginRoute ? (
        <LoginPage />
      ) : isAdminRoute ? (
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      ) : (
        <UserLayout />
      )}
      
      <PWABadge />
    </div>
  );
};

// App Root Component
function AppRoot() {
  const [pwaInitialized, setPwaInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializePWA();
        setPwaInitialized(true);
      } catch (error) {
        console.error('Failed to initialize PWA:', error);
        setInitializationError(error.message);
        setPwaInitialized(true); // Tetap lanjut meski ada error
      }
    };

    init();
  }, []);

  if (!pwaInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Menyiapkan aplikasi...</p>
          <p className="mt-2 text-sm text-gray-500">Mengaktifkan fitur offline</p>
        </div>
      </div>
    );
  }

  if (initializationError) {
    console.warn('PWA initialization had issues:', initializationError);
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Render the app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);