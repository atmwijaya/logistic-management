import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "https://logistic-backend-nu.vercel.app/api/faq";
//const BASE_URL = "http://localhost:3000/api/faq";

// Enhanced fetchAPI dengan better error handling
const fetchAPI = async (url, options = {}) => {
  try {
    console.log('🚀 FAQ API Call:', {
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

    console.log('📡 FAQ API Response status:', response.status);
    
    if (!response.ok) {
      // Jika endpoint tidak ditemukan (404), throw error khusus
      if (response.status === 404) {
        throw new Error('ENDPOINT_NOT_FOUND');
      }
      
      const responseText = await response.text();
      console.error('❌ FAQ API Error Response:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || `HTTP error! status: ${response.status}` };
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    // Handle empty response
    if (!responseText) {
      return { success: true, data: null, message: "Operation completed successfully" };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('⚠️ FAQ Response is not JSON, returning as text');
      return { success: true, data: responseText, message: "Operation completed" };
    }
    
    console.log('✅ FAQ API Success Response:', result);
    return result;
  } catch (error) {
    console.error('💥 FAQ API Fetch Error:', error);
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

const faqAPI = {
  // Get all active FAQs (Public)
  getAll: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`📋 Fetching all FAQs with params:`, params);
      const result = await fetchAPI(url);
      console.log(`📋 Retrieved ${result.data?.length || 0} FAQ records`);
      return result;
    } catch (error) {
      console.error('❌ Error in getAll FAQs:', error);
      // Fallback ke Supabase langsung jika backend error
      console.log('🔄 Trying fallback to direct Supabase...');
      return await faqAPI.supabase.getAllActive();
    }
  },

  // Get all FAQs for admin (including inactive) - Admin only
  getAllForAdmin: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = `${BASE_URL}/admin/all${queryString}`;
      
      console.log(`👑 Fetching all FAQs for admin with params:`, params);
      const result = await fetchAPI(url);
      console.log(`👑 Retrieved ${result.data?.length || 0} FAQ records for admin`);
      return result;
    } catch (error) {
      if (error.message === 'ENDPOINT_NOT_FOUND') {
        console.log('🔄 Admin endpoint not found, falling back to direct Supabase...');
        return await faqAPI.supabase.getAllForAdmin();
      }
      console.error('❌ Error in getAllForAdmin FAQs:', error);
      return await faqAPI.supabase.getAllForAdmin();
    }
  },

  // Get FAQ by ID (Public)
  getById: async (id) => {
    try {
      console.log(`🔍 Fetching FAQ by ID: ${id}`);
      const result = await fetchAPI(`${BASE_URL}/${id}`);
      console.log(`🔍 Retrieved FAQ:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching FAQ ${id}:`, error);
      return await faqAPI.supabase.getById(id);
    }
  },

  // Get FAQs by category (Public)
  getByCategory: async (category, params = {}) => {
    try {
      const queryParams = { ...params, category };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}/category/${category}${queryString}`;
      
      console.log(`📂 Fetching FAQs by category: ${category}`);
      const result = await fetchAPI(url);
      console.log(`📂 Retrieved ${result.data?.length || 0} FAQs in category ${category}`);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching FAQs by category ${category}:`, error);
      return await faqAPI.supabase.getByCategory(category);
    }
  },

  // Create new FAQ (Admin only)
  create: async (faqData) => {
    try {
      console.log(`➕ Creating new FAQ:`, faqData);
      
      // Validasi data
      const validation = faqAPI.utils.validateFAQ(faqData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', '),
          data: null
        };
      }
      
      const result = await fetchAPI(BASE_URL, {
        method: "POST",
        body: JSON.stringify(faqData),
      });
      
      console.log(`➕ FAQ created successfully:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error creating FAQ:`, error);
      // Fallback ke Supabase langsung
      console.log('🔄 Trying fallback to direct Supabase create...');
      return await faqAPI.supabase.create(faqData);
    }
  },

  // Update FAQ (Admin only)
  update: async (id, faqData) => {
    try {
      console.log(`✏️ Updating FAQ ${id}:`, faqData);
      
      // Validasi data
      const validation = faqAPI.utils.validateFAQ(faqData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', '),
          data: null
        };
      }
      
      const result = await fetchAPI(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(faqData),
      });
      
      console.log(`✏️ FAQ updated successfully:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error updating FAQ ${id}:`, error);
      return await faqAPI.supabase.update(id, faqData);
    }
  },

  // Delete FAQ (Admin only)
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting FAQ: ${id}`);
      
      const result = await fetchAPI(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      
      console.log(`🗑️ FAQ deleted successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error deleting FAQ ${id}:`, error);
      return await faqAPI.supabase.delete(id);
    }
  },

  // Toggle FAQ status active/inactive (Admin only)
  toggleStatus: async (id, is_active) => {
    try {
      console.log(`🔄 Toggling FAQ ${id} status to: ${is_active}`);
      
      const result = await fetchAPI(`${BASE_URL}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      });
      
      console.log(`🔄 FAQ status updated successfully:`, result.data);
      return result;
    } catch (error) {
      console.error(`❌ Error toggling FAQ ${id} status:`, error);
      return await faqAPI.supabase.toggleStatus(id, is_active);
    }
  },

  // Search FAQs
  search: async (searchTerm, params = {}) => {
    try {
      const queryParams = { ...params, search: searchTerm };
      const queryString = buildQueryString(queryParams);
      const url = `${BASE_URL}${queryString}`;
      
      console.log(`🔎 Searching FAQs for: "${searchTerm}"`);
      const result = await fetchAPI(url);
      console.log(`🔎 Search found ${result.data?.length || 0} FAQ results`);
      return result;
    } catch (error) {
      console.error(`❌ Error searching FAQs for "${searchTerm}":`, error);
      return await faqAPI.supabase.search(searchTerm);
    }
  },

  // Get FAQ categories
  getCategories: async () => {
    try {
      console.log(`📂 Fetching FAQ categories`);
      
      // First try to get from backend
      const result = await faqAPI.getAll();
      
      if (result.success && result.data) {
        const categories = [...new Set(result.data
          .map(faq => faq.category)
          .filter(category => category && category.trim() !== '')
        )];
        
        console.log(`📂 Retrieved ${categories.length} categories`);
        return {
          success: true,
          data: categories,
          message: 'Categories retrieved successfully'
        };
      }
      
      return {
        success: true,
        data: ['General', 'Peminjaman', 'Pengembalian', 'Teknis', 'Lainnya'],
        message: 'Using default categories'
      };
    } catch (error) {
      console.error('❌ Error fetching FAQ categories:', error);
      return await faqAPI.supabase.getCategories();
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      console.log('❤️ Performing FAQ API health check');
      const result = await fetchAPI(`${BASE_URL}/health/check`);
      console.log('❤️ Health check result:', result);
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        message: 'FAQ API health check failed',
        error: error.message
      };
    }
  },

  // Direct Supabase operations (fallback jika backend tidak tersedia)
  supabase: {
    // Get all active FAQs langsung dari Supabase
    getAllActive: async () => {
      try {
        console.log('📋 [Fallback] Fetching active FAQs directly from Supabase');
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [Fallback] Supabase error in getAllActive:', error);
          throw new Error(error.message || 'Supabase error');
        }

        console.log(`✅ [Fallback] Retrieved ${data?.length || 0} active FAQs from Supabase`);
        return {
          success: true,
          data: data || [],
          message: 'FAQs retrieved successfully from Supabase (Fallback)'
        };
      } catch (error) {
        console.error('❌ [Fallback] Error fetching FAQs from Supabase:', error);
        return {
          success: false,
          message: error.message || 'Gagal memuat FAQ dari Supabase',
          data: []
        };
      }
    },

    // Get all FAQs including inactive langsung dari Supabase
    getAllForAdmin: async () => {
      try {
        console.log('👑 [Fallback] Fetching all FAQs for admin directly from Supabase');
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [Fallback] Supabase error in getAllForAdmin:', error);
          throw new Error(error.message || 'Supabase error');
        }

        console.log(`✅ [Fallback] Retrieved ${data?.length || 0} FAQs for admin from Supabase`);
        return {
          success: true,
          data: data || [],
          message: 'FAQs retrieved successfully from Supabase (Fallback - Admin)'
        };
      } catch (error) {
        console.error('❌ [Fallback] Error fetching FAQs for admin from Supabase:', error);
        return {
          success: false,
          message: error.message || 'Gagal memuat FAQ untuk admin dari Supabase',
          data: []
        };
      }
    },

    // Get FAQ by ID
    getById: async (id) => {
      try {
        console.log(`🔍 [Fallback] Fetching FAQ by ID: ${id}`);
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error(`❌ [Fallback] Supabase error in getById ${id}:`, error);
          throw new Error(error.message || 'Supabase error');
        }

        console.log(`✅ [Fallback] Retrieved FAQ:`, data);
        return {
          success: true,
          data: data,
          message: 'FAQ retrieved successfully from Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error fetching FAQ ${id} from Supabase:`, error);
        return {
          success: false,
          message: error.message || `Gagal memuat FAQ ${id} dari Supabase`,
          data: null
        };
      }
    },

    // Get FAQs by category
    getByCategory: async (category) => {
      try {
        console.log(`📂 [Fallback] Fetching FAQs by category: ${category}`);
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`❌ [Fallback] Supabase error in getByCategory ${category}:`, error);
          throw new Error(error.message || 'Supabase error');
        }

        console.log(`✅ [Fallback] Retrieved ${data?.length || 0} FAQs in category ${category}`);
        return {
          success: true,
          data: data || [],
          message: 'FAQs retrieved successfully from Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error fetching FAQs by category ${category} from Supabase:`, error);
        return {
          success: false,
          message: error.message || `Gagal memuat FAQ kategori ${category} dari Supabase`,
          data: []
        };
      }
    },

    // Create FAQ langsung di Supabase
    create: async (faqData) => {
      try {
        console.log('➕ [Fallback] Creating FAQ directly in Supabase:', faqData);
        
        // Siapkan data untuk insert
        const insertData = {
          question: faqData.question,
          answer: faqData.answer,
          category: faqData.category || 'General',
          is_active: faqData.is_active !== undefined ? faqData.is_active : true
        };

        console.log('📤 [Fallback] Insert data:', insertData);

        const { data, error } = await supabase
          .from('faqs')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('❌ [Fallback] Supabase error in create:', error);
          console.error('❌ [Fallback] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(error.message || 'Supabase insert error');
        }

        console.log('✅ [Fallback] FAQ created successfully in Supabase:', data);
        return {
          success: true,
          data,
          message: 'FAQ created successfully in Supabase (Fallback)'
        };
      } catch (error) {
        console.error('❌ [Fallback] Error creating FAQ in Supabase:', error);
        return {
          success: false,
          message: error.message || 'Gagal membuat FAQ di Supabase',
          data: null
        };
      }
    },

    // Update FAQ langsung di Supabase
    update: async (id, faqData) => {
      try {
        console.log(`✏️ [Fallback] Updating FAQ ${id} directly in Supabase:`, faqData);
        
        const updateData = {
          question: faqData.question,
          answer: faqData.answer,
          category: faqData.category,
          is_active: faqData.is_active,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('faqs')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error(`❌ [Fallback] Supabase error updating FAQ ${id}:`, error);
          throw new Error(error.message || 'Supabase update error');
        }

        console.log(`✅ [Fallback] FAQ ${id} updated successfully in Supabase`);
        return {
          success: true,
          data,
          message: 'FAQ updated successfully in Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error updating FAQ ${id} in Supabase:`, error);
        return {
          success: false,
          message: error.message || `Gagal mengupdate FAQ ${id} di Supabase`,
          data: null
        };
      }
    },

    // Delete FAQ langsung di Supabase
    delete: async (id) => {
      try {
        console.log(`🗑️ [Fallback] Deleting FAQ ${id} directly in Supabase`);
        
        const { error } = await supabase
          .from('faqs')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`❌ [Fallback] Supabase error deleting FAQ ${id}:`, error);
          throw new Error(error.message || 'Supabase delete error');
        }

        console.log(`✅ [Fallback] FAQ ${id} deleted successfully in Supabase`);
        return {
          success: true,
          message: 'FAQ deleted successfully in Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error deleting FAQ ${id} in Supabase:`, error);
        return {
          success: false,
          message: error.message || `Gagal menghapus FAQ ${id} di Supabase`,
          data: null
        };
      }
    },

    // Toggle status FAQ
    toggleStatus: async (id, is_active) => {
      try {
        console.log(`🔄 [Fallback] Toggling FAQ ${id} status to: ${is_active}`);
        
        const { data, error } = await supabase
          .from('faqs')
          .update({
            is_active: is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error(`❌ [Fallback] Supabase error toggling status FAQ ${id}:`, error);
          throw new Error(error.message || 'Supabase update error');
        }

        console.log(`✅ [Fallback] FAQ ${id} status updated successfully in Supabase`);
        return {
          success: true,
          data,
          message: 'FAQ status updated successfully in Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error toggling status FAQ ${id} in Supabase:`, error);
        return {
          success: false,
          message: error.message || `Gagal mengubah status FAQ ${id} di Supabase`,
          data: null
        };
      }
    },

    // Search FAQs
    search: async (searchTerm) => {
      try {
        console.log(`🔎 [Fallback] Searching FAQs for: "${searchTerm}"`);
        
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`❌ [Fallback] Supabase error searching FAQs:`, error);
          throw new Error(error.message || 'Supabase search error');
        }

        console.log(`✅ [Fallback] Search found ${data?.length || 0} results`);
        return {
          success: true,
          data: data || [],
          message: 'Search completed successfully in Supabase (Fallback)'
        };
      } catch (error) {
        console.error(`❌ [Fallback] Error searching FAQs in Supabase:`, error);
        return {
          success: false,
          message: error.message || 'Gagal mencari FAQ di Supabase',
          data: []
        };
      }
    },

    // Get categories
    getCategories: async () => {
      try {
        console.log(`📂 [Fallback] Fetching categories from Supabase`);
        
        const { data, error } = await supabase
          .from('faqs')
          .select('category')
          .eq('is_active', true);

        if (error) {
          console.error('❌ [Fallback] Supabase error getting categories:', error);
          throw new Error(error.message || 'Supabase error');
        }

        const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
        
        console.log(`✅ [Fallback] Retrieved ${categories.length} categories`);
        return {
          success: true,
          data: categories,
          message: 'Categories retrieved successfully from Supabase (Fallback)'
        };
      } catch (error) {
        console.error('❌ [Fallback] Error getting categories from Supabase:', error);
        return {
          success: true,
          data: ['General', 'Peminjaman', 'Pengembalian', 'Teknis', 'Lainnya'],
          message: 'Using default categories (Fallback)'
        };
      }
    }
  },

  // Utility functions
  utils: {
    // Format date for display
    formatDate: (dateString) => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return '-';
      }
    },

    // Format datetime for display
    formatDateTime: (dateString) => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return '-';
      }
    },

    // Get status color
    getStatusColor: (isActive) => {
      return isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200';
    },

    // Get status text
    getStatusText: (isActive) => {
      return isActive ? 'Aktif' : 'Non-Aktif';
    },

    // Get category color
    getCategoryColor: (category) => {
      const colors = {
        'General': 'bg-blue-100 text-blue-800 border border-blue-200',
        'Peminjaman': 'bg-green-100 text-green-800 border border-green-200',
        'Pengembalian': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'Teknis': 'bg-purple-100 text-purple-800 border border-purple-200',
        'Lainnya': 'bg-gray-100 text-gray-800 border border-gray-200'
      };
      return colors[category] || 'bg-gray-100 text-gray-800 border border-gray-200';
    },

    // Get category text
    getCategoryText: (category) => {
      return category || 'General';
    },

    // Validate FAQ data
    validateFAQ: (faqData) => {
      const errors = [];
      
      if (!faqData.question || faqData.question.trim() === '') {
        errors.push('Pertanyaan harus diisi');
      }
      
      if (!faqData.answer || faqData.answer.trim() === '') {
        errors.push('Jawaban harus diisi');
      }
      
      if (faqData.question && faqData.question.length > 500) {
        errors.push('Pertanyaan maksimal 500 karakter');
      }
      
      if (faqData.answer && faqData.answer.length > 2000) {
        errors.push('Jawaban maksimal 2000 karakter');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Generate initial FAQ data
    getInitialFAQData: () => {
      return {
        question: '',
        answer: '',
        category: 'General',
        is_active: true
      };
    }
  }
};

export default faqAPI;