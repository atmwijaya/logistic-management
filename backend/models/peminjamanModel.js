import { supabase } from "../config/supabaseClient.js";

export const PeminjamanModel = {
  // Create new peminjaman
  async create(peminjamanData) {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .insert([peminjamanData])
        .select(`
          *,
          barang:katalog(*)
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating peminjaman:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all peminjaman with barang details
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          barang:katalog(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting peminjaman:', error);
      return { success: false, error: error.message };
    }
  },

  // Get peminjaman by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          barang:katalog(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting peminjaman by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Update peminjaman status - FIXED: Gunakan .single() untuk menghindari JSON coercion error
  async updateStatus(id, status) {
    try {
      console.log('🔧 Updating status for ID:', id, 'to:', status);
      
      // Update the status dan langsung ambil data yang terupdate
      const { data, error } = await supabase
        .from('peminjaman')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          barang:katalog(*)
        `)
        .single(); // GUNAKAN .single() di sini

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Update successful, updated data:', data);
      
      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('❌ Error updating peminjaman status:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Delete peminjaman
  async delete(id) {
    try {
      console.log('🗑️ Deleting peminjaman with ID:', id);
      
      const { error } = await supabase
        .from('peminjaman')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }

      console.log('✅ Peminjaman deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting peminjaman:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // Search peminjaman
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          barang:katalog(*)
        `)
        .or(`nama_lengkap.ilike.%${searchTerm}%,nim.ilike.%${searchTerm}%,barang.nama.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error searching peminjaman:', error);
      return { success: false, error: error.message };
    }
  },

  // Filter by status
  async getByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select(`
          *,
          barang:katalog(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error filtering peminjaman by status:', error);
      return { success: false, error: error.message };
    }
  },

  // Get peminjaman stats
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('peminjaman')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(item => item.status === 'pending').length,
        approved: data.filter(item => item.status === 'approved').length,
        rejected: data.filter(item => item.status === 'rejected').length
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { success: false, error: error.message };
    }
  }
};