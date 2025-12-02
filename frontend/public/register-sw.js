(function() {
  console.log('🔧 Service Worker Registration Check');
  console.log('URL:', window.location.href);
  console.log('Protocol:', window.location.protocol);
  console.log('Hostname:', window.location.hostname);
  
  // Cek support dengan detail
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '[::1]';
  
  const isHttps = window.location.protocol === 'https:';
  
  console.log('Is localhost:', isLocalhost);
  console.log('Is HTTPS:', isHttps);
  
  // Service Worker hanya support di:
  // 1. localhost (http://localhost)
  // 2. HTTPS sites
  // 3. file:// TIDAK DIDUKUNG
  
  const isServiceWorkerSupported = 'serviceWorker' in navigator;
  console.log('SW API available:', isServiceWorkerSupported);
  
  if (!isServiceWorkerSupported) {
    console.error('❌ Browser does not support Service Workers');
    console.error('This might be because:');
    console.error('1. Using old browser (update Chrome/Firefox)');
    console.error('2. Incognito/Private mode might block SW');
    console.error('3. Security settings or extensions blocking');
    return;
  }
  
  // Cek context security
  if (!isHttps && !isLocalhost) {
    console.error('❌ Service Workers require HTTPS for production!');
    console.error('Current protocol:', window.location.protocol);
    return;
  }
  
  console.log('✅ Environment supports Service Workers');
  
  // Tunggu halaman load
  window.addEventListener('load', () => {
    console.log('📄 Page loaded, registering Service Worker...');
    
    // Coba beberapa path
    const swPaths = [
      '/sw.js',
      '/sw.js?version=' + Date.now(), // Cache bust
      './sw.js'
    ];
    
    let registered = false;
    
    for (const swPath of swPaths) {
      if (registered) break;
      
      console.log('🔄 Trying path:', swPath);
      
      navigator.serviceWorker.register(swPath, {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        console.log('✅ SUCCESS! Service Worker registered:', swPath);
        console.log('Scope:', registration.scope);
        console.log('Registration object:', registration);
        
        registered = true;
        
        // Track SW state changes
        if (registration.installing) {
          console.log('📥 Service Worker installing');
          registration.installing.addEventListener('statechange', (e) => {
            console.log('SW state:', e.target.state);
          });
        }
        
        if (registration.waiting) {
          console.log('⏳ Service Worker waiting');
        }
        
        if (registration.active) {
          console.log('🎯 Service Worker active');
        }
        
        // Check for updates
        setInterval(() => {
          console.log('🔄 Checking for updates...');
          registration.update();
        }, 60 * 60 * 1000);
        
      })
      .catch((error) => {
        console.error(`❌ Failed to register from ${swPath}:`, error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      });
    }
    
    // Cek apakah ada SW yang sudah registered
    setTimeout(() => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log('📋 Total registrations:', registrations.length);
        registrations.forEach((reg, index) => {
          console.log(`Registration ${index + 1}:`, {
            scope: reg.scope,
            activeState: reg.active?.state,
            scriptURL: reg.active?.scriptURL
          });
        });
      });
    }, 2000);
    
  });
})();