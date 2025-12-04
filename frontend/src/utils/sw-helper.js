export const SWHelper = {
  // Deteksi environment
  isLocalhost: () => 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]',
  
  isHttps: () => window.location.protocol === 'https:',
  
  getBasePath: () => {
    const path = window.location.pathname;
    if (path === '/' || this.isLocalhost()) {
      return './';
    }
    // Hitung depth
    const depth = path.split('/').filter(p => p).length;
    return '../'.repeat(depth) || './';
  },
  
  // Register dengan path yang benar
  register: async () => {
    const basePath = this.getBasePath();
    const swPath = `${basePath}sw.js`;
    
    console.log('Registering SW from:', swPath);
    
    try {
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: basePath,
        updateViaCache: 'none'
      });
      
      console.log('SW registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      throw error;
    }
  }
};