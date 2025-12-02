class ImageCacheManager {
  constructor() {
    this.cacheName = 'supabase-images-cache';
    this.cache = null;
    this.initializeCache();
  }

  async initializeCache() {
    if ('caches' in window) {
      this.cache = await caches.open(this.cacheName);
    }
  }

  // Cache gambar dari Supabase
  async cacheImage(url) {
    if (!('caches' in window) || !this.cache) return;

    try {
      // Cek apakah gambar sudah ada di cache
      const cachedResponse = await this.cache.match(url);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Jika belum ada, fetch dan cache
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (response.ok) {
        await this.cache.put(url, response.clone());
        return response;
      }
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  // Dapatkan gambar dari cache atau network
  async getImage(url) {
    if (!('caches' in window) || !this.cache) {
      return url;
    }

    try {
      // Coba dulu dari cache
      const cachedResponse = await this.cache.match(url);
      if (cachedResponse) {
        return URL.createObjectURL(await cachedResponse.blob());
      }

      // Jika tidak ada di cache, fetch dan cache
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (response.ok) {
        // Clone response untuk caching dan penggunaan
        const responseClone = response.clone();
        await this.cache.put(url, responseClone);
        
        return URL.createObjectURL(await response.blob());
      }
    } catch (error) {
      console.warn('Failed to get image:', error);
      // Return fallback image atau placeholder
      return this.getFallbackImage();
    }

    return this.getFallbackImage();
  }

  getFallbackImage() {
    // SVG placeholder untuk gambar yang tidak tersedia
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNNTAgNzVIMTUwVjEyNUg1MFY3NVoiIGZpbGw9IiNCN0I3QjciLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiNCN0I3QjciLz48L3N2Zz4=';
  }

  // Pre-cache beberapa gambar penting saat online
  async preCacheImportantImages(imageUrls = []) {
    if (!('caches' in window) || !this.cache) return;

    try {
      const cachePromises = imageUrls.map(url => this.cacheImage(url));
      await Promise.allSettled(cachePromises);
      console.log(`Pre-cached ${imageUrls.length} images`);
    } catch (error) {
      console.warn('Failed to pre-cache images:', error);
    }
  }

  // Hapus cache lama
  async cleanupCache() {
    if (!('caches' in window) || !this.cache) return;

    try {
      const keys = await caches.keys();
      const deletePromises = keys
        .filter(key => key !== this.cacheName)
        .map(key => caches.delete(key));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

// Singleton instance
const imageCacheManager = new ImageCacheManager();

export default imageCacheManager;