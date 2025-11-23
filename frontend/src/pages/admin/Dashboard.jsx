import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Eye,
  MessageCircle,
  User,
} from "lucide-react";
import peminjamanAPI from "../../api/peminjamanAPI";
import riwayatAPI from "../../api/riwayatAPI";
import { data } from "react-router-dom";

const AdminHomePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("tahun-ini");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [konfirmasiTerbaru, setKonfirmasiTerbaru] = useState([]);
  const [statistikPeminjam, setStatistikPeminjam] = useState([]);
  const [statistikOverview, setStatistikOverview] = useState({
    totalPeminjaman: 0,
    pendingKonfirmasi: 0,
    sedangDipinjam: 0,
    totalPendapatan: 0,
    totalDenda: 0,
    selesai: 0,
  });
  const [selectedPeminjam, setSelectedPeminjam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const peminjamanResult = await peminjamanAPI.getAll();
      if (peminjamanResult.success) {
        const allPeminjaman = peminjamanResult.data || [];
        console.log("📊 Data peminjaman dari API:", allPeminjaman);

        const formattedPeminjaman = allPeminjaman.slice(0, 5).map((item) => ({
          id: item.id,
          nama: item.nama_lengkap,
          nim: item.nim,
          barang:
            item.barang_nama || item.barang?.nama || `Barang ${item.barang_id}`,
          barang_gambar: item.barang_gambar || item.barang?.gambar,
          tanggalPinjam: peminjamanAPI.utils.formatDate(item.tanggal_mulai),
          tanggalKembali: peminjamanAPI.utils.formatDate(item.tanggal_selesai),
          jumlah: item.jumlah_pinjam || 1,
          totalHarga: item.total_biaya || 0,
          status: item.status || "pending",
          waktuDiajukan: formatTimeAgo(item.created_at),
          instansi: item.instansi || "Universitas Diponegoro",
          telepon: item.telepon,
          jurusan: item.jurusan,
          email: item.email,
          catatan: item.catatan,
          lama_pinjam: item.lama_pinjam,
          originalData: item,
        }));

        setKonfirmasiTerbaru(formattedPeminjaman);

        // Calculate overview statistics dari semua data peminjaman
        const pendingCount = allPeminjaman.filter(
          (p) => p.status === "pending"
        ).length;
        const approvedCount = allPeminjaman.filter(
          (p) => p.status === "approved"
        ).length;

        // Total peminjaman = semua status
        const totalPeminjaman = allPeminjaman.length;

        console.log("📈 Statistik peminjaman:", {
          total: totalPeminjaman,
          pending: pendingCount,
          approved: approvedCount,
        });

        setStatistikOverview((prev) => ({
          ...prev,
          totalPeminjaman: totalPeminjaman,
          pendingKonfirmasi: pendingCount,
          sedangDipinjam: approvedCount,
        }));
      }

      // Load riwayat statistics untuk total pendapatan
      const riwayatStats = await riwayatAPI.getStatistik();
      console.log("💰 Statistik riwayat:", riwayatStats);

      if (riwayatStats.success && riwayatStats.data) {
        setStatistikOverview((prev) => ({
          ...prev,
          totalPendapatan: riwayatStats.data.totalPendapatan || 0,
        }));
      } else {
        const riwayatResult = await riwayatAPI.getAll();
        if (riwayatResult.success) {
          const totalPendapatan = riwayatData.reduce(
            (sum, item) => sum + (item.total_biaya || 0),
            0
          );
          const totalDenda = riwayatData.reduce(
            (sum, item) => sum + (item.denda || 0),
            0
          );
          const selesaiCount = riwayatData.filter(
            (item) => item.status_akhir === "selesai"
          ).length;

          setStatistikOverview((prev) => ({
            ...prev,
            totalPendapatan: totalPendapatan,
            totalDenda: totalDenda,
            selesai: selesaiCount,
          }));
        }
      }

      // Load chart data dengan data real
      await loadChartData();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      console.log("🔄 Memulai load chart data...");

      // Gabungkan data dari peminjaman aktif DAN riwayat yang sudah selesai
      const [peminjamanResult, riwayatResult] = await Promise.all([
        peminjamanAPI.getAll(),
        riwayatAPI.getAll(),
      ]);

      let allData = [];

      // Tambahkan data dari peminjaman aktif
      if (peminjamanResult.success && peminjamanResult.data) {
        console.log("📦 Data peminjaman aktif:", peminjamanResult.data.length);
        allData = [
          ...allData,
          ...peminjamanResult.data.map((item) => ({
            ...item,
            source: "peminjaman_aktif",
          })),
        ];
      } else {
        console.warn("❌ Gagal mengambil data peminjaman aktif");
      }

      // Tambahkan data dari riwayat yang sudah selesai
      if (riwayatResult.success && riwayatResult.data) {
        console.log("📊 Data riwayat selesai:", riwayatResult.data.length);

        // Format data riwayat agar konsisten dengan peminjaman aktif
        const formattedRiwayat = riwayatResult.data.map((item) => ({
          id: item.id,
          nama_lengkap: item.nama_lengkap,
          nim: item.nim,
          barang_nama: item.barang_nama,
          barang_id: item.barang_id,
          jumlah_pinjam: item.jumlah_pinjam || 1,
          tanggal_mulai: item.tanggal_mulai,
          tanggal_selesai: item.tanggal_selesai,
          total_biaya: item.total_biaya || 0,
          status: "completed", // Set status sebagai completed untuk riwayat
          status_akhir: item.status_akhir,
          created_at:
            item.created_at || item.completed_at || new Date().toISOString(),
          completed_at: item.completed_at,
          instansi: item.instansi,
          jurusan: item.jurusan,
          telepon: item.telepon,
          email: item.email,
          catatan: item.catatan,
          lama_pinjam: item.lama_pinjam,
          denda: item.denda || 0,
          kondisi_kembali: item.kondisi_kembali,
          source: "riwayat_selesai",
        }));

        allData = [...allData, ...formattedRiwayat];
      } else {
        console.warn("❌ Gagal mengambil data riwayat");
      }

      console.log("📈 Total data gabungan untuk chart:", allData.length);
      console.log("🔍 Sample data:", allData.slice(0, 3));

      // Proses data untuk chart
      const monthlyStats = {};
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const currentYear = new Date().getFullYear();

      // Inisialisasi semua bulan dalam setahun dengan nilai 0
      for (let i = 0; i < 12; i++) {
        const monthYear = `${currentYear}-${(i + 1)
          .toString()
          .padStart(2, "0")}`;
        monthlyStats[monthYear] = {
          bulan: months[i],
          peminjam: 0,
          pendapatan: 0,
          dataCount: 0, // Untuk debugging
        };
      }

      // Hitung statistik per bulan
      allData.forEach((item, index) => {
        let date;

        // Cari tanggal yang tersedia (prioritaskan created_at, lalu completed_at, lalu tanggal_mulai)
        if (item.created_at) {
          date = new Date(item.created_at);
        } else if (item.completed_at) {
          date = new Date(item.completed_at);
        } else if (item.tanggal_mulai) {
          date = new Date(item.tanggal_mulai);
        } else {
          console.warn(
            `⚠️ Item ${index} tidak memiliki tanggal yang valid:`,
            item
          );
          return; // Skip jika tidak ada tanggal
        }

        // Pastikan tanggal valid
        if (isNaN(date.getTime())) {
          console.warn(`⚠️ Item ${index} memiliki tanggal invalid:`, date);
          return;
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthYear = `${year}-${month.toString().padStart(2, "0")}`;
        const bulanKey = months[date.getMonth()];

        // Hanya proses data tahun ini
        if (year !== currentYear) {
          console.log(
            `📅 Skip data tahun ${year} - hanya proses ${currentYear}`
          );
          return;
        }

        // Inisialisasi jika belum ada
        if (!monthlyStats[monthYear]) {
          monthlyStats[monthYear] = {
            bulan: bulanKey,
            peminjam: 0,
            pendapatan: 0,
            dataCount: 0,
          };
        }

        // Hitung peminjam (setiap transaksi dihitung 1)
        monthlyStats[monthYear].peminjam += 1;

        // Hitung pendapatan dari total_biaya
        const pendapatan = item.total_biaya || 0;
        monthlyStats[monthYear].pendapatan += pendapatan;
        monthlyStats[monthYear].dataCount += 1;

        console.log(
          `📊 Bulan ${bulanKey}: +1 peminjam, +${formatRupiah(
            pendapatan
          )} pendapatan (Source: ${item.source})`
        );
      });

      // Convert to array dan pastikan urutan bulan benar
      const chartData = Object.values(monthlyStats).sort((a, b) => {
        return months.indexOf(a.bulan) - months.indexOf(b.bulan);
      });

      // Debug summary
      const totalPeminjam = chartData.reduce(
        (sum, item) => sum + item.peminjam,
        0
      );
      const totalPendapatan = chartData.reduce(
        (sum, item) => sum + item.pendapatan,
        0
      );

      console.log("🎯 Final chart data summary:");
      console.log("📅 Period:", selectedPeriod);
      console.log("👥 Total Peminjam:", totalPeminjam);
      console.log("💰 Total Pendapatan:", formatRupiah(totalPendapatan));
      console.log("📊 Chart data detail:", chartData);

      setStatistikPeminjam(chartData);
    } catch (error) {
      console.error("❌ Error loading chart data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });

      // Fallback ke data kosong untuk semua bulan
      loadEmptyChartData();
    }
  };

  const getActiveMonthsCount = () => {
    if (!statistikPeminjam || statistikPeminjam.length === 0) return 0;

    const activeMonths = statistikPeminjam.filter((item) => item.peminjam > 0);
    return activeMonths.length;
  };

  // Hitung rata-rata peminjam per bulan (hanya bulan yang aktif)
  const calculateAveragePeminjam = () => {
    const activeMonthsCount = getActiveMonthsCount();

    if (activeMonthsCount === 0) return 0;

    const totalPeminjam = statistikPeminjam.reduce(
      (sum, item) => sum + item.peminjam,
      0
    );
    const average = Math.round(totalPeminjam / activeMonthsCount);

    console.log("📊 Rata-rata peminjam:", {
      totalPeminjam,
      activeMonthsCount,
      average,
    });

    return average;
  };

  const calculateAveragePendapatan = () => {
    const activeMonthsCount = getActiveMonthsCount();

    if (activeMonthsCount === 0) return formatRupiah(0);

    const totalPendapatan = statistikPeminjam.reduce(
      (sum, item) => sum + item.pendapatan,
      0
    );
    const average = Math.round(totalPendapatan / activeMonthsCount);

    console.log("💰 Rata-rata pendapatan:", {
      totalPendapatan,
      activeMonthsCount,
      average: formatRupiah(average),
    });

    return formatRupiah(average);
  };

  const loadEmptyChartData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const emptyChartData = months.map((bulan) => ({
      bulan,
      peminjam: 0,
      pendapatan: 0,
      dataCount: 0,
    }));

    console.log("📊 Empty chart data:", emptyChartData);
    setStatistikPeminjam(emptyChartData);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Beberapa waktu lalu";

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1
        ? "Baru saja"
        : `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  // Filter konfirmasi berdasarkan search term
  const filteredKonfirmasi = konfirmasiTerbaru.filter(
    (konfirmasi) =>
      konfirmasi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      konfirmasi.nim.includes(searchTerm) ||
      konfirmasi.barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "pending":
        return "Menunggu";
      default:
        return "Tidak Diketahui";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatRupiah = (angka) => {
    return peminjamanAPI.utils.formatCurrency(angka);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleApprove = async (id) => {
    try {
      const result = await peminjamanAPI.updateStatus(id, "approved");
      if (result.success) {
        // Update local state
        setKonfirmasiTerbaru((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "approved" } : item
          )
        );

        // Reload statistics
        loadDashboardData();
      } else {
        console.error("Failed to approve:", result.message);
        alert(`Gagal menyetujui: ${result.message}`);
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert("Terjadi kesalahan saat menyetujui peminjaman");
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await peminjamanAPI.updateStatus(id, "rejected");
      if (result.success) {
        // Update local state
        setKonfirmasiTerbaru((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "rejected" } : item
          )
        );

        // Reload statistics
        loadDashboardData();
      } else {
        console.error("Failed to reject:", result.message);
        alert(`Gagal menolak: ${result.message}`);
      }
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Terjadi kesalahan saat menolak peminjaman");
    }
  };

  const handleContact = (telepon) => {
    if (!telepon) {
      alert("Nomor telepon tidak tersedia");
      return;
    }
    const message = `Halo! Mengenai peminjaman barang Anda...`;
    const whatsappUrl = `https://wa.me/${telepon.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleViewDetails = (peminjam) => {
    setSelectedPeminjam(peminjam);
    setShowDetailModal(true);
  };

  // Calculate trends based on current vs previous data
  const calculateTrend = (currentData, previousData) => {
    if (!previousData || previousData === 0) return "+0%";
    const change = ((currentData - previousData) / previousData) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Calculate chart max values for scaling
  const getChartMaxValues = () => {
    if (statistikPeminjam.length === 0)
      return { peminjam: 10, pendapatan: 1000000 };

    const maxPeminjam = Math.max(
      ...statistikPeminjam.map((item) => item.peminjam)
    );
    const maxPendapatan = Math.max(
      ...statistikPeminjam.map((item) => item.pendapatan)
    );

    return {
      peminjam: Math.max(maxPeminjam, 1), // Minimum 1 untuk scaling
      pendapatan: Math.max(maxPendapatan, 100000), // Minimum 100rb untuk scaling
    };
  };

  const chartMaxValues = getChartMaxValues();

  // Calculate total dari chart data untuk sinkronisasi
  const totalPeminjamChart = statistikPeminjam.reduce(
    (sum, item) => sum + item.peminjam,
    0
  );
  const totalPendapatanChart = statistikPeminjam.reduce(
    (sum, item) => sum + item.pendapatan,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Kelola peminjaman barang dan pantau statistik
          </p>
        </div>

        {/* Statistik Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Peminjaman
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPeminjamChart}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>
                {calculateTrend(
                  statistikOverview.totalPeminjaman,
                  Math.round(statistikOverview.totalPeminjaman * 0.88)
                )}{" "}
                dari bulan lalu
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Konfirmasi
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistikOverview.pendingKonfirmasi}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Menunggu persetujuan</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Sedang Dipinjam
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistikOverview.sedangDipinjam}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Aktif sekarang</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pendapatan
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatRupiah(statistikOverview.totalPendapatan)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>
                {calculateTrend(
                  statistikOverview.totalPendapatan,
                  Math.round(statistikOverview.totalPendapatan * 0.92)
                )}{" "}
                dari bulan lalu
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Konfirmasi Terbaru */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Konfirmasi Terbaru
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Table - Ukuran lebih kecil */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">
                        Peminjam & Barang
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">
                        Periode
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredKonfirmasi.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            {/* Gambar produk lebih kecil */}
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.barang_gambar ? (
                                <img
                                  src={item.barang_gambar}
                                  alt={item.barang}
                                  className="w-10 h-10 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hidden">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {item.nama}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mb-1 truncate">
                                NIM: {item.nim}
                              </p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.barang}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {item.jumlah} unit • {item.instansi}
                              </p>
                              <p className="text-xs text-blue-600 font-medium">
                                {formatRupiah(item.totalHarga)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-900 mb-1">
                            <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>
                              {item.tanggalPinjam} - {item.tanggalKembali}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {item.waktuDiajukan}
                          </p>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusIcon(item.status)}
                            <span className="text-xs">
                              {getStatusText(item.status)}
                            </span>
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                              title="Detail Peminjaman"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleContact(item.telepon)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                              title="Hubungi via WhatsApp"
                              disabled={!item.telepon}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                                  title="Setujui Peminjaman"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                  title="Tolak Peminjaman"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredKonfirmasi.length === 0 && (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchTerm
                      ? "Tidak ada hasil pencarian"
                      : "Tidak ada data konfirmasi"}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => (window.location.href = "/peminjaman")}
                className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-xs"
              >
                Lihat Semua Konfirmasi →
              </button>
            </div>
          </div>

          {/* Right Column - Statistik Peminjam */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Statistik Peminjam per Bulan
              </h2>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="bulan-ini">Bulan Ini</option>
                  <option value="3-bulan">3 Bulan</option>
                  <option value="6-bulan">6 Bulan</option>
                  <option value="tahun-ini">Tahun Ini</option>
                </select>
              </div>
            </div>

            {/* Chart Container */}
            <div className="space-y-6">
              {/* Bar Chart - Peminjam */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Jumlah Peminjam</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPeminjamChart}
                  </span>
                </div>
                <div className="flex items-end justify-between h-32">
                  {statistikPeminjam.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-6 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                        style={{
                          height: `${
                            (item.peminjam / chartMaxValues.peminjam) * 100
                          }%`,
                        }}
                        title={`${item.bulan}: ${item.peminjam} peminjam`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {item.bulan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart - Pendapatan */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Total Pendapatan
                  </h3>
                  <span className="text-2xl font-bold text-green-600">
                    {formatRupiah(totalPendapatanChart)}
                  </span>
                </div>
                <div className="flex items-end justify-between h-32">
                  {statistikPeminjam.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-6 bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600"
                        style={{
                          height: `${
                            (item.pendapatan / chartMaxValues.pendapatan) * 100
                          }%`,
                        }}
                        title={`${item.bulan}: ${formatRupiah(
                          item.pendapatan
                        )}`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {item.bulan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">
                  Rata-rata Peminjam/Bulan
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {calculateAveragePeminjam()}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {getActiveMonthsCount()} bulan aktif
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">
                  Rata-rata Pendapatan/Bulan
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {calculateAveragePendapatan()}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {getActiveMonthsCount()} bulan aktif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPeminjam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detail Peminjaman
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informasi Peminjam */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Informasi Peminjam</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama Lengkap</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.nama || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">NIM</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.nim || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jurusan</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.jurusan || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instansi</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.instansi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telepon</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.telepon || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.email || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi Barang */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span>Informasi Barang</span>
                  </h4>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {selectedPeminjam.barang_gambar ? (
                        <img
                          src={selectedPeminjam.barang_gambar}
                          alt={selectedPeminjam.barang}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-xs text-gray-900">
                        {selectedPeminjam.barang || "Barang tidak tersedia"}
                      </p>
                      <p className="text-medium text-gray-600">
                        Jumlah: {selectedPeminjam.jumlah || 0} unit
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Biaya: {formatRupiah(selectedPeminjam.totalHarga)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Peminjaman */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span>Detail Peminjaman</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Mulai</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.tanggalPinjam}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Selesai</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.tanggalKembali}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lama Pinjam</p>
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.lama_pinjam || 0} hari
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Biaya</p>
                      <p className="font-medium text-gray-900">
                        {formatRupiah(selectedPeminjam.totalHarga)}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedPeminjam.status
                        )}`}
                      >
                        {getStatusIcon(selectedPeminjam.status)}
                        <span className="ml-1.5">
                          {getStatusText(selectedPeminjam.status)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catatan */}
                {selectedPeminjam.catatan && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Catatan
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                      {selectedPeminjam.catatan}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleContact(selectedPeminjam.telepon)}
                    disabled={!selectedPeminjam.telepon}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Hubungi via WhatsApp</span>
                  </button>
                  {selectedPeminjam.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedPeminjam.id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedPeminjam.id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-300"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;
