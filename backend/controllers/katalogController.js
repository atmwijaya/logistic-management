import * as KatalogModel from "../models/katalogModel.js";

// GET ALL
export const getAllKatalog = async (req, res) => {
  const { data, error } = await KatalogModel.getAllKatalog();
  if (error) return res.status(400).json({ error });
  res.status(200).json(data);
};

// GET BY ID
export const getKatalogById = async (req, res) => {
  const id = req.params.id;
  const { data, error } = await KatalogModel.getKatalogById(id);
  if (error) return res.status(404).json({ error });
  res.status(200).json(data);
};

// CREATE
export const createKatalog = async (req, res) => {
  try {
    console.log('📥 Received create request body:', req.body);
    
    // Validasi field required
    if (!req.body.nama || !req.body.harga || !req.body.stok || !req.body.deskripsi || !req.body.maksPeminjaman) {
      return res.status(400).json({ 
        error: "Field nama, harga, stok, deskripsi, dan maksPeminjaman harus diisi" 
      });
    }

    // Parse harga menjadi numeric (dalam satuan Rupiah)
    const harga = parseFloat(req.body.harga);
    if (isNaN(harga) || harga < 0) {
      return res.status(400).json({ 
        error: "Harga harus berupa angka yang valid" 
      });
    }

    // Parse stok menjadi integer
    const stok = parseInt(req.body.stok);
    if (isNaN(stok) || stok < 0) {
      return res.status(400).json({ 
        error: "Stok harus berupa angka yang valid" 
      });
    }

    const payload = {
      nama: req.body.nama,
      kategori: req.body.kategori || 'outdoor',
      status: req.body.status || 'tersedia',
      harga: harga,
      stok: stok,
      maks_peminjaman: req.body.maksPeminjaman, // Tetap string seperti "7 hari"
      kualitas: req.body.kualitas || 'Bagus',
      deskripsi: req.body.deskripsi,
      lokasi: req.body.lokasi || 'Gudang Utama',
      spesifikasi: Array.isArray(req.body.spesifikasi) ? req.body.spesifikasi : 
                  (req.body.spesifikasi ? [req.body.spesifikasi] : []),
      gambar: req.body.gambar || [] // Array URL gambar dari Supabase
    };

    console.log('🎯 Processed payload for database:', payload);

    const { data, error: dbError } = await KatalogModel.createKatalog(payload);

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return res.status(400).json({ error: dbError.message });
    }
    
    console.log('✅ Katalog created successfully:', data);
    res.status(201).json({ 
      message: "Katalog berhasil ditambahkan", 
      data: data && data.length > 0 ? data[0] : data 
    });
  } catch (error) {
    console.error('💥 Create katalog error:', error);
    res.status(400).json({ error: error.message });
  }
};

// UPDATE
export const updateKatalog = async (req, res) => {
  try {
    const id = req.params.id;

    const payload = {
      nama: req.body.nama,
      kategori: req.body.kategori,
      status: req.body.status,
      harga: parseFloat(req.body.harga) || 0,
      stok: parseInt(req.body.stok) || 0,
      maks_peminjaman: req.body.maksPeminjaman,
      kualitas: req.body.kualitas,
      deskripsi: req.body.deskripsi,
      lokasi: req.body.lokasi,
      spesifikasi: Array.isArray(req.body.spesifikasi) ? req.body.spesifikasi : [req.body.spesifikasi],
      gambar: req.body.gambar || []
    };

    const { data, error } = await KatalogModel.updateKatalog(id, payload);

    if (error) return res.status(400).json({ error });
    res.status(200).json({ message: "Katalog berhasil diperbarui", data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PATCH
export const toggleStatusKatalog = async (req, res) => {
  try {
    const id = req.params.id;
    const { data: currentData, error: fetchError } = await KatalogModel.getKatalogById(id);
    if (fetchError) {
      return res.status(404).json({ error: "Barang tidak ditemukan" });
    }
    const newStatus = currentData.status === 'tersedia' ? 'tidak_tersedia' : 'tersedia';
    const { data, error } = await KatalogModel.updateKatalog(id, { status: newStatus });
    if (error) return res.status(400).json({ error });
    res.status(200).json({ 
      message: `Status berhasil diubah menjadi ${newStatus === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}`,
      data: data && data.length > 0 ? data[0] : data
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
export const deleteKatalog = async (req, res) => {
  const id = req.params.id;

  const { error } = await KatalogModel.deleteKatalog(id);

  if (error) return res.status(400).json({ error });
  res.status(200).json({ message: "Katalog berhasil dihapus" });
};