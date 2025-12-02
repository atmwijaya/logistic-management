import React, { useState, useEffect, useRef } from 'react';
import imageCacheManager from '../utils/imageCache';
import { WifiOff, Image as ImageIcon } from 'lucide-react';

const OfflineImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  lazy = true,
  ...props 
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const imgRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Gunakan cache manager untuk mendapatkan gambar
        const url = await imageCacheManager.getImage(src);
        setImageUrl(url);
      } catch (error) {
        console.warn('Failed to load image:', error);
        setImageUrl(imageCacheManager.getFallbackImage());
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup object URL saat component unmount
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src]);

  // Jika ada custom fallback
  if (!isOnline && fallback) {
    return fallback;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="opacity-0">
          <img src="" alt="" {...props} />
        </div>
      </div>
    );
  }

  // Offline state tanpa gambar
  if (!isOnline && !imageUrl) {
    return (
      <div className={`relative bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <WifiOff className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Gambar tidak tersedia offline</span>
        </div>
        <div className="opacity-0">
          <img src="" alt="" {...props} />
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageUrl}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
      loading={lazy ? "lazy" : "eager"}
      onError={(e) => {
        console.warn('Image failed to load:', src);
        e.target.src = imageCacheManager.getFallbackImage();
      }}
      {...props}
    />
  );
};

export default OfflineImage;