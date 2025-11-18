import { createClient } from '@supabase/supabase-js';

const supabase = createClient (
    'https://ispttoyjzbfafmiuhkeu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcHR0b3lqemJmYWZtaXVoa2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODIwODksImV4cCI6MjA3ODk1ODA4OX0.4sMQ40ue26fZo_LVO0t2G-lS6qEKgX8SPKoDtqq4uuc'
)

const BASE_URL = "http://localhost:3000/api/katalog";

// Helper function untuk handle fetch
const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Upload image ke Supabase Storage
const uploadImageToSupabase = async (file) => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload file ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('katalog') // Nama bucket di Supabase
      .upload(filePath, file);

    if (error) {
      throw new Error(`Gagal upload gambar: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('katalog')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload multiple images
const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadImageToSupabase(file));
  return await Promise.all(uploadPromises);
};

// Delete image dari Supabase
const deleteImageFromSupabase = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from('katalog')
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      // Tidak throw error karena delete image tidak critical
    }
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
  }
};

const katalogAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    return await fetchAPI(url);
  },

  getById: async (id) => {
    return await fetchAPI(`${BASE_URL}/${id}`);
  },

  create: async (data) => {
    try {
      // Jika ada file gambar, upload dulu
      if (data.gambar && data.gambar.length > 0) {
        const uploadedImages = await uploadMultipleImages(data.gambar);
        data.gambar = uploadedImages.map(img => img.url);
      }

      return await fetchAPI(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      if (data.gambar && data.gambar.length > 0 && data.gambar[0] instanceof File) {
        const uploadedImages = await uploadMultipleImages(data.gambar);
        data.gambar = uploadedImages.map(img => img.url);
      }

      return await fetchAPI(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  delete: async (id) => {
    return await fetchAPI(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id) => {
    return await fetchAPI(`${BASE_URL}/${id}/toggle-status`, {
      method: "PATCH",
    });
  },

  // Export upload functions untuk digunakan di component
  uploadImageToSupabase,
  uploadMultipleImages,
  deleteImageFromSupabase
};

export default katalogAPI;