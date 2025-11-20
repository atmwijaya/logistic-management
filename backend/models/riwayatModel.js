import { supabase } from "../config/supabaseClient.js";

async function getPeminjamanById(id) {
  const { data, error } = await supabase
    .from("peminjaman")
    .select(
      `
      *,
      katalog:barang_id (
        nama,
        gambar,
        harga
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  if (data) {
    return {
      ...data,
      barang_nama: data.katalog?.nama || "Barang tidak tersedia",
      barang_gambar: data.katalog?.gambar,
      barang_harga: data.katalog?.harga,
    };
  }

  return null;
}

export const RiwayatPeminjaman = {
  pindahkanKeRiwayat: async (
    peminjamanData,
    statusAkhir = "selesai",
    kondisiKembali = "baik",
    denda = 0,
    catatanAdmin = ""
  ) => {
    const { data, error } = await supabase
      .from("riwayat_peminjaman")
      .insert([
        {
          peminjaman_id: peminjamanData.id,
          nama_lengkap: peminjamanData.nama_lengkap,
          nim: peminjamanData.nim,
          jurusan: peminjamanData.jurusan,
          instansi: peminjamanData.instansi,
          barang_nama: peminjamanData.barang_nama || "Barang tidak tersedia",
          barang_gambar: peminjamanData.barang_gambar,
          barang_harga: peminjamanData.barang_harga,
          jumlah_pinjam: peminjamanData.jumlah_pinjam,
          tanggal_mulai: peminjamanData.tanggal_mulai,
          tanggal_selesai: peminjamanData.tanggal_selesai,
          lama_pinjam: peminjamanData.lama_pinjam,
          total_biaya: peminjamanData.total_biaya,
          catatan: peminjamanData.catatan,
          telepon: peminjamanData.telepon,
          email: peminjamanData.email,
          status_akhir: statusAkhir,
          kondisi_kembali: kondisiKembali,
          denda: denda,
          catatan_admin: catatanAdmin,
          completed_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  hapusDariPeminjamanAktif: async (id) => {
    const { error } = await supabase.from("peminjaman").delete().eq("id", id);

    if (error) {
      console.error("Error deleting from peminjaman:", error);
      throw error;
    }

    console.log(`✅ Successfully deleted peminjaman with ID: ${id}`);
    return true;
  },

  tambahTimeline: async (peminjamanId, status, catatan = "") => {
    const { data, error } = await supabase
      .from("peminjaman_timeline")
      .insert([
        {
          peminjaman_id: peminjamanId,
          status: status,
          catatan: catatan,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  getTimelineByPeminjamanId: async (peminjamanId) => {
    const { data, error } = await supabase
      .from("peminjaman_timeline")
      .select("*")
      .eq("peminjaman_id", peminjamanId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  getAllRiwayat: async (page = 1, limit = 10, filters = {}) => {
    const startIndex = (page - 1) * limit;

    let query = supabase
      .from("riwayat_peminjaman")
      .select("*", { count: "exact" });

    if (filters.search) {
      query = query.or(
        `nama_lengkap.ilike.%${filters.search}%,nim.ilike.%${filters.search}%,barang_nama.ilike.%${filters.search}%`
      );
    }

    if (filters.startDate && filters.endDate) {
      query = query
        .gte("created_at", filters.startDate)
        .lte("created_at", filters.endDate);
    }

    if (filters.status_akhir) {
      query = query.eq("status_akhir", filters.status_akhir);
    }

    if (filters.kondisi_kembali) {
      query = query.eq("kondisi_kembali", filters.kondisi_kembali);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) throw error;

    return {
      data,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  },

  getStatistik: async () => {
    const { data, error } = await supabase
      .from("riwayat_peminjaman")
      .select("status_akhir, kondisi_kembali, total_biaya, denda");

    if (error) throw error;

    const totalPeminjaman = data.length;
    const totalPendapatan = data.reduce(
      (sum, item) => sum + parseFloat(item.total_biaya || 0),
      0
    );
    const totalDenda = data.reduce(
      (sum, item) => sum + parseFloat(item.denda || 0),
      0
    );
    const selesai = data.filter(
      (item) => item.status_akhir === "selesai"
    ).length;
    const dibatalkan = data.filter(
      (item) => item.status_akhir === "dibatalkan"
    ).length;

    return {
      totalPeminjaman,
      totalPendapatan,
      totalDenda,
      selesai,
      dibatalkan,
    };
  },
};
