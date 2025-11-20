import { RiwayatPeminjaman } from '../models/riwayatModel.js';
import { supabase } from '../config/supabaseClient.js';

// Helper function untuk get peminjaman by ID
async function getPeminjamanById(id) {
  const { data, error } = await supabase
    .from('peminjaman')
    .select(`
      *,
      katalog:barang_id (
        nama,
        gambar,
        harga
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Data tidak ditemukan
    }
    throw error;
  }

  // Format data untuk konsistensi
  if (data) {
    return {
      ...data,
      barang_nama: data.katalog?.nama || 'Barang tidak tersedia',
      barang_gambar: data.katalog?.gambar,
      barang_harga: data.katalog?.harga
    };
  }

  return null;
}

export const riwayatController = {
  // Get semua riwayat
  getAllRiwayat: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, startDate, endDate, status_akhir, kondisi_kembali } = req.query;
      
      const filters = {
        search,
        startDate,
        endDate,
        status_akhir,
        kondisi_kembali
      };

      const result = await RiwayatPeminjaman.getAllRiwayat(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.data,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching riwayat peminjaman',
        error: error.message
      });
    }
  },

  // Get statistik
  getStatistik: async (req, res) => {
    try {
      const statistik = await RiwayatPeminjaman.getStatistik();
      
      res.json({
        success: true,
        data: statistik
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistik',
        error: error.message
      });
    }
  },

  // Selesaikan peminjaman
  selesaikanPeminjaman: async (req, res) => {
    try {
      const { peminjamanId, kondisiKembali = 'baik', catatanAdmin = '', denda = 0 } = req.body;

      // 1. Get data peminjaman aktif
      const peminjamanData = await getPeminjamanById(peminjamanId);
      
      if (!peminjamanData) {
        return res.status(404).json({
          success: false,
          message: 'Data peminjaman tidak ditemukan'
        });
      }

      // 2. Pindahkan ke riwayat
      await RiwayatPeminjaman.pindahkanKeRiwayat(
        peminjamanData, 
        'selesai', 
        kondisiKembali, 
        denda, 
        catatanAdmin
      );
      
      // 3. Hapus dari peminjaman aktif
      const deleteSuccess = await RiwayatPeminjaman.hapusDariPeminjamanAktif(peminjamanId);
      if (!deleteSuccess) {
        throw new Error('Gagal menghapus dari peminjaman aktif');
      }

      // 4. Tambah timeline selesai
      await RiwayatPeminjaman.tambahTimeline(peminjamanId, 'selesai', 'Peminjaman telah selesai');

      res.json({
        success: true,
        message: 'Peminjaman berhasil diselesaikan dan dipindahkan ke riwayat'
      });
    } catch (error) {
    console.error('Error in selesaikanPeminjaman:', error);
      res.status(500).json({
        success: false,
        message: 'Error menyelesaikan peminjaman',
        error: error.message
      });
    }
  },

  // Update timeline
  updateTimeline: async (req, res) => {
    try {
      const { peminjamanId, status, catatan } = req.body;

      await RiwayatPeminjaman.tambahTimeline(peminjamanId, status, catatan);

      res.json({
        success: true,
        message: 'Timeline berhasil diupdate'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating timeline',
        error: error.message
      });
    }
  },

  // Get timeline by peminjaman
  getTimeline: async (req, res) => {
    try {
      const { peminjamanId } = req.params;

      const timeline = await RiwayatPeminjaman.getTimelineByPeminjamanId(peminjamanId);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching timeline',
        error: error.message
      });
    }
  },

  // Export riwayat
  exportRiwayat: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let query = supabase
        .from('riwayat_peminjaman')
        .select('*');

      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error exporting riwayat',
        error: error.message
      });
    }
  },

  // Get detail riwayat by ID
  getRiwayatById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('riwayat_peminjaman')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Data riwayat tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching detail riwayat',
        error: error.message
      });
    }
  }
};