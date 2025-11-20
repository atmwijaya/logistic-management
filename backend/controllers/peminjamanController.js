import { PeminjamanModel } from '../models/peminjamanModel.js';

export const PeminjamanController = {
  // Create new peminjaman
  async createPeminjaman(req, res) {
    try {
      const {
        nama_lengkap,
        nim,
        jurusan,
        instansi,
        barang_id,
        jumlah_pinjam,
        tanggal_mulai,
        tanggal_selesai,
        lama_pinjam,
        total_biaya,
        catatan,
        telepon,
        email
      } = req.body;

      // Validate required fields
      if (!nama_lengkap || !nim || !barang_id || !tanggal_mulai || !tanggal_selesai || !telepon) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, NIM, barang, tanggal, dan telepon wajib diisi'
        });
      }

      // Validate phone number format (minimal 10 digit)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(telepon.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Format nomor telepon tidak valid. Gunakan format internasional (contoh: +628123456789)'
        });
      }

      const peminjamanData = {
        nama_lengkap,
        nim,
        jurusan: jurusan || '',
        instansi: instansi || '',
        barang_id,
        jumlah_pinjam: parseInt(jumlah_pinjam) || 1,
        tanggal_mulai,
        tanggal_selesai,
        lama_pinjam: parseInt(lama_pinjam) || 1,
        total_biaya: parseFloat(total_biaya) || 0,
        catatan: catatan || '',
        telepon: telepon.replace(/\s/g, ''), // Remove spaces
        email: email || '',
        status: 'pending',
        metode_konfirmasi: 'whatsapp'
      };

      const result = await PeminjamanModel.create(peminjamanData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Peminjaman berhasil dibuat',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Error in createPeminjaman:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  },

  // Get all peminjaman
  async getAllPeminjaman(req, res) {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;

      let result;
      if (search) {
        result = await PeminjamanModel.search(search);
      } else if (status && status !== 'semua') {
        result = await PeminjamanModel.getByStatus(status);
      } else {
        result = await PeminjamanModel.getAll();
      }

      if (result.success) {
        // Simple pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = result.data.slice(startIndex, endIndex);

        res.json({
          success: true,
          data: paginatedData,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.data.length / limit),
            totalItems: result.data.length,
            itemsPerPage: parseInt(limit)
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Error in getAllPeminjaman:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  },

  // Get peminjaman by ID
  async getPeminjamanById(req, res) {
    try {
      const { id } = req.params;

      const result = await PeminjamanModel.getById(id);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Peminjaman tidak ditemukan'
        });
      }
    } catch (error) {
      console.error('Error in getPeminjamanById:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  },

  // Update peminjaman status - FIXED
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log(`🔄 Controller: Updating status for ${id} to ${status}`);

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Pilih: pending, approved, atau rejected'
        });
      }

      const result = await PeminjamanModel.updateStatus(id, status);

      if (result.success) {
        console.log(`✅ Controller: Status updated successfully for ${id}`);
        
        // Jika status rejected, hapus dari database setelah beberapa waktu
        if (status === 'rejected') {
          setTimeout(async () => {
            try {
              console.log(`🔄 Auto-deleting rejected peminjaman: ${id}`);
              await PeminjamanModel.delete(id);
              console.log(`✅ Auto-deleted rejected peminjaman: ${id}`);
            } catch (deleteError) {
              console.error(`❌ Failed to auto-delete rejected peminjaman ${id}:`, deleteError);
            }
          }, 5000); // Hapus setelah 5 detik
        }

        res.json({
          success: true,
          message: `Status berhasil diubah menjadi ${status}`,
          data: result.data
        });
      } else {
        console.error(`❌ Controller: Failed to update status for ${id}:`, result.error);
        res.status(400).json({
          success: false,
          message: result.error || 'Gagal mengupdate status'
        });
      }
    } catch (error) {
      console.error('❌ Controller: Error in updateStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  },

  // Delete peminjaman
  async deletePeminjaman(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`🗑️ Controller: Deleting peminjaman ${id}`);

      const result = await PeminjamanModel.delete(id);

      if (result.success) {
        console.log(`✅ Controller: Peminjaman ${id} deleted successfully`);
        res.json({
          success: true,
          message: 'Peminjaman berhasil dihapus'
        });
      } else {
        console.error(`❌ Controller: Failed to delete peminjaman ${id}:`, result.error);
        res.status(400).json({
          success: false,
          message: result.error || 'Gagal menghapus peminjaman'
        });
      }
    } catch (error) {
      console.error('❌ Controller: Error in deletePeminjaman:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  },

  // Get stats
  async getStats(req, res) {
    try {
      const result = await PeminjamanModel.getStats();

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
};