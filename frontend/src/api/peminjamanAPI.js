import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "http://localhost:3000/api/peminjaman";

// Enhanced fetchAPI dengan better error handling
const fetchAPI = async (url, options = {}) => {
  try {
    console.log('🚀 API Call:', {
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

    console.log('📡 API Response status:', response.status);
    
    const responseText = await response.text();
    console.log('📡 API Response text:', responseText);
    
    if (!response.ok) {
      console.error('❌ API Error Response:', responseText);
      
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
      console.warn('⚠️ Response is not JSON, returning as text');
      return { success: true, data: responseText, message: "Operation completed" };
    }
    
    console.log('✅ API Success Response:', result);
    return result;
  } catch (error) {
    console.error('💥 API Fetch Error:', error);
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

const peminjamanAPI = {
  // Get all peminjaman dengan filter dan pagination
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📋 Fetching all peminjaman with params:`, params);
      const result = await fetchAPI(url);
      console.log(`📋 Retrieved ${result.data?.length || 0} peminjaman records`);
      return result;
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal memuat data peminjaman',
        data: [] 
      };
    }
  },

  // Get peminjaman by ID
  getById: async (id) => {
    try {
      console.log(`🔍 Fetching peminjaman by ID: ${id}`);
      const result = await fetchAPI(`${BASE_URL}/${id}`);
      console.log(`🔍 Retrieved peminjaman:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching peminjaman ${id}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat data peminjaman ${id}`,
        data: null 
      };
    }
  },

  // Create new peminjaman
  create: async (data) => {
    try {
      console.log('🆕 Creating new peminjaman:', data);
      const result = await fetchAPI(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
      console.log('🆕 Peminjaman created successfully:', result.data);
      return result;
    } catch (error) {
      console.error('❌ Error creating peminjaman:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal membuat peminjaman',
        data: null 
      };
    }
  },

  // Update status peminjaman - FIXED VERSION
  updateStatus: async (id, status) => {
    try {
      console.log(`🔄 Updating status for ${id} to ${status}`);
      
      if (!id) {
        throw new Error('ID is required for status update');
      }
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: pending, approved, rejected`);
      }

      const result = await fetchAPI(`${BASE_URL}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      
      console.log(`🔄 Status update response:`, result);
      
      // Handle different response formats
      if (result.success) {
        return result;
      } else if (result.data) {
        // Jika response memiliki data tapi tidak ada success field
        return { success: true, data: result.data, message: result.message || "Status updated successfully" };
      } else if (Array.isArray(result)) {
        // Jika response adalah array
        return { success: true, data: result, message: "Status updated successfully" };
      } else {
        // Jika response adalah object biasa
        return { success: true, data: result, message: "Status updated successfully" };
      }
    } catch (error) {
      console.error(`❌ Error updating status for ${id}:`, error);
      
      // Return structured error response
      return { 
        success: false, 
        message: error.message || `Error updating status for ${id}`,
        data: null
      };
    }
  },

  // Delete peminjaman
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting peminjaman: ${id}`);
      const result = await fetchAPI(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      console.log(`🗑️ Peminjaman deleted successfully: ${id}`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting peminjaman ${id}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal menghapus peminjaman ${id}`,
        data: null 
      };
    }
  },

  // Search peminjaman
  search: async (searchTerm, params = {}) => {
    try {
      const queryParams = { ...params, search: searchTerm };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`🔎 Searching peminjaman for: "${searchTerm}"`);
      const result = await fetchAPI(url);
      console.log(`🔎 Search found ${result.data?.length || 0} results`);
      return result;
    } catch (error) {
      console.error(`❌ Error searching for "${searchTerm}":`, error);
      return { 
        success: false, 
        message: error.message || `Gagal mencari peminjaman untuk "${searchTerm}"`,
        data: [] 
      };
    }
  },

  // Get peminjaman by status
  getByStatus: async (status, params = {}) => {
    try {
      const queryParams = { ...params, status };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📊 Fetching peminjaman with status: ${status}`);
      const result = await fetchAPI(url);
      console.log(`📊 Found ${result.data?.length || 0} peminjaman with status ${status}`);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching peminjaman with status ${status}:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat peminjaman dengan status ${status}`,
        data: [] 
      };
    }
  },

  // Get statistics (opsional, untuk dashboard)
  getStats: async () => {
    try {
      console.log('📈 Fetching peminjaman statistics');
      const result = await fetchAPI(`${BASE_URL}/stats`);
      console.log('📈 Statistics retrieved:', result.data);
      return result;
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      // Return default stats if endpoint doesn't exist
      return {
        success: true,
        data: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      };
    }
  },

  // Bulk update status (opsional)
  bulkUpdateStatus: async (ids, status) => {
    try {
      console.log(`🔄 Bulk updating ${ids.length} records to status: ${status}`);
      const result = await fetchAPI(`${BASE_URL}/bulk/status`, {
        method: "PATCH",
        body: JSON.stringify({ ids, status }),
      });
      console.log(`🔄 Bulk update successful: ${result.data?.updated || 0} records updated`);
      return result;
    } catch (error) {
      console.error('❌ Error in bulk update:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal melakukan bulk update',
        data: null 
      };
    }
  },

  // Check if barang can be deleted (no active peminjaman)
  canDeleteBarang: async (barangId) => {
    try {
      console.log(`🔍 Checking if barang ${barangId} can be deleted`);
      
      // Cek apakah ada peminjaman aktif untuk barang ini
      const peminjamanResult = await fetchAPI(`${BASE_URL}/barang/${barangId}/active`);
      
      if (peminjamanResult.success && peminjamanResult.data && peminjamanResult.data.length > 0) {
        return { 
          success: true, 
          canDelete: false, 
          activePeminjaman: peminjamanResult.data,
          message: "Tidak dapat menghapus barang karena ada peminjaman aktif" 
        };
      }
      
      return { 
        success: true, 
        canDelete: true, 
        activePeminjaman: [],
        message: "Barang dapat dihapus" 
      };
    } catch (error) {
      console.error(`❌ Error checking barang deletability:`, error);
      // Jika endpoint tidak ada, anggap bisa dihapus
      return { 
        success: true, 
        canDelete: true, 
        activePeminjaman: [],
        message: "Barang dapat dihapus" 
      };
    }
  },

  // Get active peminjaman for barang
  getActivePeminjamanByBarang: async (barangId) => {
    try {
      console.log(`🔍 Getting active peminjaman for barang ${barangId}`);
      
      const result = await fetchAPI(`${BASE_URL}/barang/${barangId}/active`);
      return result;
    } catch (error) {
      console.error(`❌ Error getting active peminjaman:`, error);
      return { 
        success: false, 
        message: error.message || `Gagal memuat peminjaman aktif untuk barang ${barangId}`,
        data: [] 
      };
    }
  },

  // Export data to CSV/Excel (opsional)
  exportData: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}/export${queryString}`;
      
      console.log('📤 Exporting peminjaman data');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `peminjaman-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('📤 Export completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal mengekspor data' 
      };
    }
  },

  // Health check (opsional)
  healthCheck: async () => {
    try {
      console.log('🏥 Performing API health check');
      const result = await fetchAPI(`${BASE_URL}/health`);
      console.log('🏥 API health check passed');
      return result;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      return { 
        success: false, 
        message: error.message || 'Health check failed' 
      };
    }
  },

  // Get available status options
  getStatusOptions: () => {
    return [
      { value: 'pending', label: 'Menunggu' },
      { value: 'approved', label: 'Disetujui' },
      { value: 'rejected', label: 'Ditolak' }
    ];
  },

  // Validate peminjaman data before submission
  validatePeminjaman: (data) => {
    const errors = [];
    
    if (!data.nama_lengkap?.trim()) {
      errors.push('Nama lengkap wajib diisi');
    }
    
    if (!data.nim?.trim()) {
      errors.push('NIM wajib diisi');
    }
    
    if (!data.barang_id) {
      errors.push('Barang wajib dipilih');
    }
    
    if (!data.tanggal_mulai) {
      errors.push('Tanggal mulai wajib diisi');
    }
    
    if (!data.tanggal_selesai) {
      errors.push('Tanggal selesai wajib diisi');
    }
    
    if (!data.telepon?.trim()) {
      errors.push('Nomor telepon wajib diisi');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format data for submission
  formatPeminjamanData: (rawData) => {
    return {
      nama_lengkap: rawData.nama_lengkap?.trim() || '',
      nim: rawData.nim?.trim() || '',
      jurusan: rawData.jurusan?.trim() || '',
      instansi: rawData.instansi?.trim() || '',
      barang_id: rawData.barang_id,
      jumlah_pinjam: parseInt(rawData.jumlah_pinjam) || 1,
      tanggal_mulai: rawData.tanggal_mulai,
      tanggal_selesai: rawData.tanggal_selesai,
      lama_pinjam: parseInt(rawData.lama_pinjam) || 1,
      total_biaya: parseFloat(rawData.total_biaya) || 0,
      catatan: rawData.catatan?.trim() || '',
      telepon: rawData.telepon?.replace(/\s/g, '') || '',
      email: rawData.email?.trim() || ''
    };
  },

  // Export untuk penggunaan langsung dengan Supabase (jika diperlukan)
  supabase,

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

    // Format currency
    formatCurrency: (amount) => {
      if (!amount) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    },

    // Calculate total cost
    calculateTotalCost: (hargaPerHari, jumlahPinjam, lamaPinjam) => {
      return (parseFloat(hargaPerHari) || 0) * (parseInt(jumlahPinjam) || 1) * (parseInt(lamaPinjam) || 1);
    }
  }
};

export default peminjamanAPI;