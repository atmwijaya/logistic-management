import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "https://logistic-backend-nu.vercel.app/api/riwayat";
//const BASE_URL = "http://localhost:3000/api/riwayat";

// Enhanced fetchAPI dengan better error handling
const fetchAPI = async (url, options = {}) => {
  try {
    console.log('🚀 RIWAYAT API Call:', {
      url,
      method: options.method || 'GET',
      body: options.body
    });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('📡 RIWAYAT API Response status:', response.status);
    
    const responseText = await response.text();
    console.log('📡 RIWAYAT API Response text:', responseText);
    
    if (!response.ok) {
      console.error('❌ RIWAYAT API Error Response:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || `HTTP error! status: ${response.status}` };
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty response
    if (!responseText) {
      return { success: true, data: null, message: "Operation completed successfully" };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('⚠️ RIWAYAT Response is not JSON, returning as text');
      return { success: true, data: responseText, message: "Operation completed" };
    }
    
    console.log('✅ RIWAYAT API Success Response:', result);
    return result;
  } catch (error) {
    console.error('💥 RIWAYAT API Fetch Error:', error);
    throw error;
  }
};

// Helper untuk build query parameters
const buildQueryString = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  return queryString ? `?${queryString}` : '';
};

const riwayatAPI = {
  // Get all riwayat dengan filter dan pagination
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📋 Fetching all riwayat with params:`, params);
      const result = await fetchAPI(url);
      console.log(`📋 Retrieved ${result.data?.length || 0} riwayat records`);
      return result;
    } catch (error) {
      console.error('❌ Error in getAll riwayat:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal memuat data riwayat',
        data: [] 
      };
    }
  },

  // Get riwayat by ID
  getById: async (id) => {
    try {
      console.log(`🔍 Fetching riwayat by ID: ${id}`);
      const result = await fetchAPI(`${BASE_URL}/${id}`);
      console.log(`🔍 Retrieved riwayat:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching riwayat ${id}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat data riwayat ${id}`,
        data: null 
      };
    }
  },

  // Selesaikan peminjaman dan pindahkan ke riwayat
  selesaikanPeminjaman: async (peminjamanId, kondisiKembali = 'baik', denda = 0, catatanAdmin = '') => {
    try {
      console.log(`✅ Menyelesaikan peminjaman: ${peminjamanId}`);
      
      const result = await fetchAPI(`${BASE_URL}/selesai`, {
        method: "POST",
        body: JSON.stringify({
          peminjamanId,
          kondisiKembali,
          denda,
          catatanAdmin
        }),
      });
      
      console.log(`✅ Peminjaman selesai response:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error menyelesaikan peminjaman ${peminjamanId}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal menyelesaikan peminjaman ${peminjamanId}`,
        data: null 
      };
    }
  },

  // Update timeline peminjaman
  updateTimeline: async (peminjamanId, status, catatan = '') => {
    try {
      console.log(`🔄 Updating timeline for ${peminjamanId} to ${status}`);
      
      const result = await fetchAPI(`${BASE_URL}/timeline`, {
        method: "POST",
        body: JSON.stringify({
          peminjamanId,
          status,
          catatan
        }),
      });
      
      console.log(`🔄 Timeline update response:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error updating timeline for ${peminjamanId}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal mengupdate timeline ${peminjamanId}`,
        data: null 
      };
    }
  },

  // Get timeline by peminjaman ID
  getTimeline: async (peminjamanId) => {
    try {
      console.log(`📅 Fetching timeline for: ${peminjamanId}`);
      const result = await fetchAPI(`${BASE_URL}/timeline/${peminjamanId}`);
      console.log(`📅 Retrieved timeline:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching timeline ${peminjamanId}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat timeline ${peminjamanId}`,
        data: [] 
      };
    }
  },

  // Get statistik riwayat
  getStatistik: async () => {
    try {
      console.log('📈 Fetching riwayat statistics');
      const result = await fetchAPI(`${BASE_URL}/statistik`);
      console.log('📈 Statistics retrieved:', result.data);
      return result;
    } catch (error) {
      console.error('❌ Error fetching riwayat statistics:', error);
      // Return default stats if endpoint doesn't exist
      return {
        success: true,
        data: {
          totalPeminjaman: 0,
          totalPendapatan: 0,
          totalDenda: 0,
          selesai: 0,
          dibatalkan: 0
        }
      };
    }
  },

  // Export riwayat data
  exportData: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}/export${queryString}`;
      
      console.log('📤 Exporting riwayat data');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `riwayat-peminjaman-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('📤 Export completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error exporting riwayat data:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal mengekspor data riwayat' 
      };
    }
  },

  // Search riwayat
  search: async (searchTerm, params = {}) => {
    try {
      const queryParams = { ...params, search: searchTerm };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`🔎 Searching riwayat for: "${searchTerm}"`);
      const result = await fetchAPI(url);
      console.log(`🔎 Search found ${result.data?.length || 0} results`);
      return result;
    } catch (error) {
      console.error(`❌ Error searching riwayat for "${searchTerm}":`, error);
      return { 
        success: false, 
        message: error.message || `Gagal mencari riwayat untuk "${searchTerm}"`,
        data: [] 
      };
    }
  },

  // Get riwayat by status
  getByStatus: async (status, params = {}) => {
    try {
      const queryParams = { ...params, status_akhir: status };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📊 Fetching riwayat with status: ${status}`);
      const result = await fetchAPI(url);
      console.log(`📊 Found ${result.data?.length || 0} riwayat with status ${status}`);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching riwayat with status ${status}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat riwayat dengan status ${status}`,
        data: [] 
      };
    }
  },

  // Get riwayat by kondisi kembali
  getByKondisi: async (kondisi, params = {}) => {
    try {
      const queryParams = { ...params, kondisi_kembali: kondisi };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📊 Fetching riwayat with kondisi: ${kondisi}`);
      const result = await fetchAPI(url);
      console.log(`📊 Found ${result.data?.length || 0} riwayat with kondisi ${kondisi}`);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching riwayat with kondisi ${kondisi}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat riwayat dengan kondisi ${kondisi}`,
        data: [] 
      };
    }
  },

  // Utility functions
  utils: {
    // Format date for display
    formatDate: (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    // Format datetime for display
    formatDateTime: (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Format currency
    formatCurrency: (amount) => {
      if (!amount) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    },

    // Get status color
    getStatusColor: (status) => {
      switch (status) {
        case 'selesai': return 'bg-green-100 text-green-800 border border-green-200';
        case 'dibatalkan': return 'bg-red-100 text-red-800 border border-red-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    },

    // Get status text
    getStatusText: (status) => {
      switch (status) {
        case 'selesai': return 'Selesai';
        case 'dibatalkan': return 'Dibatalkan';
        default: return status;
      }
    },

    // Get kondisi color
    getKondisiColor: (kondisi) => {
      switch (kondisi) {
        case 'baik': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'rusak_ringan': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        case 'rusak_berat': return 'bg-red-100 text-red-800 border border-red-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    },

    // Get kondisi text
    getKondisiText: (kondisi) => {
      switch (kondisi) {
        case 'baik': return 'Baik';
        case 'rusak_ringan': return 'Rusak Ringan';
        case 'rusak_berat': return 'Rusak Berat';
        default: return kondisi;
      }
    }
  }
};

export default riwayatAPI;