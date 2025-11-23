import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  Calendar,
  Package,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckSquare,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import peminjamanAPI from "../../api/peminjamanAPI";
import riwayatAPI from "../../api/riwayatAPI";

const DaftarPeminjam = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPeminjam, setSelectedPeminjam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [daftarPeminjam, setDaftarPeminjam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState({});
  const [showKondisiModal, setShowKondisiModal] = useState(false);
  const [selectedPeminjamanId, setSelectedPeminjamanId] = useState(null);
  const [kondisiKembali, setKondisiKembali] = useState("baik");
  const [denda, setDenda] = useState(0);
  const [catatanAdmin, setCatatanAdmin] = useState("");

  // Timeline steps configuration
  const timelineSteps = [
    { key: "disetujui", label: "Disetujui", color: "bg-green-500" },
    { key: "diambil", label: "Diambil", color: "bg-blue-500" },
    { key: "digunakan", label: "Sedang Digunakan", color: "bg-yellow-500" },
    { key: "kembali", label: "Kembali", color: "bg-purple-500" },
  ];

  // Fetch data peminjaman dari backend
  useEffect(() => {
    fetchPeminjaman();
  }, [statusFilter, searchTerm, currentPage, itemsPerPage]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const params = {};
      if (statusFilter !== "semua") params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      params.page = currentPage;
      params.limit = itemsPerPage;

      const result = await peminjamanAPI.getAll(params);

      if (result.success) {
        // Filter out rejected items yang seharusnya sudah dihapus
        const activePeminjaman = (result.data || []).filter(
          (item) => item.status !== "rejected"
        );

        const peminjamanWithTimeline = await Promise.all(
          activePeminjaman.map(async (peminjam) => {
            if (peminjam.status === "approved") {
              try {
                const timelineResult = await riwayatAPI.getTimeline(
                  peminjam.id
                );
                if (timelineResult.success) {
                  return { ...peminjam, timeline: timelineResult.data || [] };
                }
              } catch (error) {
                console.error(
                  `Error fetching timeline for ${peminjam.id}:`,
                  error
                );
              }
            }
            return { ...peminjam, timeline: [] };
          })
        );
        setDaftarPeminjam(peminjamanWithTimeline);
      } else {
        setError(result.message || "Gagal memuat data peminjaman");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
      console.error("Error fetching peminjaman:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data berdasarkan search term dan status
  const filteredPeminjam = daftarPeminjam;

  // Pagination
  const totalPages = Math.ceil(filteredPeminjam.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeminjam.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
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
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatWaktu = (waktu) => {
    if (!waktu) return "-";
    return new Date(waktu).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTimelineStatus = (timeline) => {
    if (!timeline || timeline.length === 0) return "pending";
    const lastStatus = timeline[timeline.length - 1].status;
    return lastStatus;
  };

  const handleApprove = async (id) => {
    try {
      setError("");
      console.log("🟢 APPROVING peminjaman with ID:", id);

      const result = await peminjamanAPI.updateStatus(id, "approved");

      console.log("🟢 APPROVE API RESULT:", result);

      if (result.success || result.data) {
        console.log("🟢 Update successful, updating UI...");

        // Update status dan tambah timeline disetujui
        setDaftarPeminjam((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "approved",
                  timeline: [
                    ...(item.timeline || []),
                    {
                      status: "disetujui",
                      catatan: "Peminjaman disetujui admin",
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : item
          )
        );

        // API call untuk update timeline
        await riwayatAPI.updateTimeline(
          id,
          "disetujui",
          "Peminjaman disetujui admin"
        );

        setSuccessMessage("Peminjaman berhasil disetujui");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("❌ APPROVE FAILED:", result.message);
        setError(result.message || "Gagal menyetujui peminjaman");
      }
    } catch (error) {
      console.error("❌ APPROVE ERROR:", error);
      setError(
        "Error: " +
          (error.message || "Terjadi kesalahan saat menyetujui peminjaman")
      );
    }
  };

  const handleReject = async (id) => {
    try {
      setError("");
      console.log("🔴 REJECTING peminjaman with ID:", id);

      // 1. Update status ke rejected
      const result = await peminjamanAPI.updateStatus(id, "rejected");

      console.log("🔴 REJECT API RESULT:", result);

      if (result.success || result.data) {
        console.log("🔴 Status updated to rejected, now deleting...");

        // 2. Hapus dari database setelah beberapa detik
        setTimeout(async () => {
          try {
            const deleteResult = await peminjamanAPI.delete(id);
            if (deleteResult.success) {
              console.log("✅ Peminjaman successfully deleted from database");
              // Hapus dari UI
              setDaftarPeminjam((prev) =>
                prev.filter((item) => item.id !== id)
              );
            } else {
              console.error(
                "❌ Failed to delete from database:",
                deleteResult.message
              );
            }
          } catch (deleteError) {
            console.error("❌ Error deleting peminjaman:", deleteError);
          }
        }, 3000);

        // 3. Update UI langsung
        setDaftarPeminjam((prev) => prev.filter((item) => item.id !== id));

        setSuccessMessage("Peminjaman berhasil ditolak dan akan dihapus");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("❌ REJECT FAILED:", result.message);
        setError(result.message || "Gagal menolak peminjaman");
      }
    } catch (error) {
      console.error("❌ REJECT ERROR:", error);
      setError(
        "Error: " +
          (error.message || "Terjadi kesalahan saat menolak peminjaman")
      );
    }
  };

  const handleUpdateTimeline = async (peminjamanId, status, catatan = "") => {
    try {
      setTimelineLoading((prev) => ({ ...prev, [peminjamanId]: true }));

      const result = await riwayatAPI.updateTimeline(
        peminjamanId,
        status,
        catatan
      );

      if (result.success) {
        // Update timeline di frontend
        setDaftarPeminjam((prev) =>
          prev.map((item) =>
            item.id === peminjamanId
              ? {
                  ...item,
                  timeline: [
                    ...(item.timeline || []),
                    {
                      status,
                      catatan,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : item
          )
        );

        setSuccessMessage(`Status berhasil diupdate ke "${status}"`);
        setTimeout(() => setSuccessMessage(""), 3000);

        // Jika status adalah 'kembali', tampilkan modal konfirmasi kondisi
        if (status === "kembali") {
          setSelectedPeminjamanId(peminjamanId);
          setShowKondisiModal(true);
        }
      } else {
        setError(result.message || "Gagal mengupdate timeline");
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      setError("Terjadi kesalahan saat mengupdate timeline");
    } finally {
      setTimelineLoading((prev) => ({ ...prev, [peminjamanId]: false }));
    }
  };

  const handleSelesaikanPeminjaman = async () => {
    try {
      setError("");
      setTimelineLoading((prev) => ({ ...prev, [selectedPeminjamanId]: true }));

      const result = await riwayatAPI.selesaikanPeminjaman(
        selectedPeminjamanId,
        kondisiKembali,
        parseFloat(denda) || 0,
        catatanAdmin
      );

      if (result.success) {
        // Hapus dari daftar peminjam aktif
        setDaftarPeminjam((prev) =>
          prev.filter((item) => item.id !== selectedPeminjamanId)
        );
        setShowKondisiModal(false);
        setShowDetailModal(false);

        setSuccessMessage(
          "Peminjaman berhasil diselesaikan dan dipindahkan ke riwayat"
        );
        setTimeout(() => setSuccessMessage(""), 3000);

        // Reset form
        setKondisiKembali("baik");
        setDenda(0);
        setCatatanAdmin("");

        // Redirect ke halaman riwayat setelah 2 detik
        setTimeout(() => {
          navigate("/admin/riwayat");
        }, 2000);
      } else {
        setError(result.message || "Gagal menyelesaikan peminjaman");
      }
    } catch (error) {
      console.error("Error completing peminjaman:", error);
      setError("Terjadi kesalahan saat menyelesaikan peminjaman");
    } finally {
      setTimelineLoading((prev) => ({
        ...prev,
        [selectedPeminjamanId]: false,
      }));
    }
  };

  const handleInspect = async (peminjam) => {
    try {
      // Fetch timeline terbaru jika status approved
      if (peminjam.status === "approved") {
        const timelineResult = await riwayatAPI.getTimeline(peminjam.id);
        if (timelineResult.success) {
          setSelectedPeminjam({
            ...peminjam,
            timeline: timelineResult.data || [],
          });
        } else {
          setSelectedPeminjam(peminjam);
        }
      } else {
        setSelectedPeminjam(peminjam);
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setSelectedPeminjam(peminjam);
      setShowDetailModal(true);
    }
  };

  const handleContact = (telepon) => {
    if (!telepon) {
      setError("Nomor telepon tidak tersedia");
      return;
    }
    const message = "Halo! Mengenai peminjaman barang Anda...";
    const whatsappUrl = `https://wa.me/${telepon.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("semua");
    setCurrentPage(1);
    fetchPeminjaman();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Simple export to CSV
    const headers = [
      "Nama",
      "NIM",
      "Barang",
      "Jumlah",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Total Biaya",
      "Status",
    ];
    const csvData = filteredPeminjam.map((p) => [
      p.nama_lengkap,
      p.nim,
      p.barang?.nama || "-",
      p.jumlah_pinjam,
      formatTanggal(p.tanggal_mulai),
      formatTanggal(p.tanggal_selesai),
      formatRupiah(p.total_biaya),
      getStatusText(p.status),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daftar-peminjam-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTimeline = (id) => {
    setExpandedTimeline(expandedTimeline === id ? null : id);
  };

  // TimelineDropdown Component
  const TimelineDropdown = ({ peminjam }) => {
    const currentTimelineStatus = getTimelineStatus(peminjam.timeline);
    const isLoading = timelineLoading[peminjam.id];

    return (
      <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleTimeline(peminjam.id)}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">
              Tracking Peminjaman
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                currentTimelineStatus === "kembali"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {currentTimelineStatus === "kembali"
                ? "Siap Diselesaikan"
                : "Berjalan"}
            </span>
          </div>
          {expandedTimeline === peminjam.id ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>

        {expandedTimeline === peminjam.id && (
          <div className="mt-3 space-y-3">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const isCompleted = peminjam.timeline?.some(
                  (t) => t.status === step.key
                );
                const isCurrent =
                  peminjam.timeline?.length > 0 &&
                  peminjam.timeline[peminjam.timeline.length - 1].status ===
                    step.key;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? step.color : "bg-gray-300"
                      } ${
                        isCurrent ? "ring-2 ring-offset-2 ring-blue-500" : ""
                      }`}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 text-center ${
                        isCompleted ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {!peminjam.timeline?.some((t) => t.status === "diambil") && (
                <button
                  onClick={() =>
                    handleUpdateTimeline(
                      peminjam.id,
                      "diambil",
                      "Barang diambil oleh peminjam"
                    )
                  }
                  disabled={isLoading}
                  className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Konfirmasi Diambil"
                  )}
                </button>
              )}

              {peminjam.timeline?.some((t) => t.status === "diambil") &&
                !peminjam.timeline?.some((t) => t.status === "digunakan") && (
                  <button
                    onClick={() =>
                      handleUpdateTimeline(
                        peminjam.id,
                        "digunakan",
                        "Barang sedang digunakan"
                      )
                    }
                    disabled={isLoading}
                    className="bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Sedang Digunakan"
                    )}
                  </button>
                )}

              {peminjam.timeline?.some((t) => t.status === "digunakan") &&
                !peminjam.timeline?.some((t) => t.status === "kembali") && (
                  <button
                    onClick={() =>
                      handleUpdateTimeline(
                        peminjam.id,
                        "kembali",
                        "Barang telah dikembalikan"
                      )
                    }
                    disabled={isLoading}
                    className="bg-purple-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Barang Kembali"
                    )}
                  </button>
                )}
            </div>

            {/* Timeline History */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Riwayat Timeline:
              </h4>
              <div className="space-y-2">
                {peminjam.timeline?.map((timeline, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        timeline.status === "disetujui"
                          ? "bg-green-500"
                          : timeline.status === "diambil"
                          ? "bg-blue-500"
                          : timeline.status === "digunakan"
                          ? "bg-yellow-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 capitalize">
                        {timeline.status}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {timeline.catatan}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatWaktu(timeline.created_at || timeline.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!peminjam.timeline || peminjam.timeline.length === 0) && (
                  <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading && daftarPeminjam.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data peminjaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daftar Peminjam
            </h1>
            <p className="text-gray-600">
              Kelola konfirmasi peminjaman barang dari WhatsApp
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Search Bar dan Tombol Riwayat */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIM, atau barang..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tombol Riwayat di sebelah search */}
              <button
                onClick={() => navigate("/admin/riwayat")}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 whitespace-nowrap"
              >
                <History className="w-4 h-4" />
                <span>Lihat Riwayat</span>
              </button>
            </div>

            {/* Refresh dan Export */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                >
                  <option value="semua">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>

            {/* Items Per Page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="10">10 per halaman</option>
                <option value="25">25 per halaman</option>
                <option value="50">50 per halaman</option>
              </select>
            </div>

            {/* Empty div untuk alignment */}
            <div></div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">
              Menampilkan {filteredPeminjam.length} peminjam
              {searchTerm && ` untuk "${searchTerm}"`}
              {statusFilter !== "semua" &&
                ` dengan status "${getStatusText(statusFilter)}"`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Peminjam & Barang
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Periode
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Biaya
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Waktu Konfirmasi
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((peminjam) => (
                  <React.Fragment key={peminjam.id}>
                    <tr
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        peminjam.status === "rejected" ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {peminjam.barang?.gambar ? (
                              <img
                                src={peminjam.barang.gambar}
                                alt={peminjam.barang.nama}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center hidden">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="font-medium text-gray-900 truncate">
                                {peminjam.nama_lengkap || "-"}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 mb-1 truncate">
                              NIM: {peminjam.nim || "-"}
                            </p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {peminjam.barang?.nama ||
                                "Barang tidak ditemukan"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {peminjam.jumlah_pinjam || 0} unit •{" "}
                              {peminjam.instansi || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>
                            {formatTanggal(peminjam.tanggal_mulai)} -{" "}
                            {formatTanggal(peminjam.tanggal_selesai)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {peminjam.lama_pinjam || 0} hari
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">
                          {formatRupiah(peminjam.total_biaya)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(peminjam.barang?.harga)}/hari
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            peminjam.status
                          )}`}
                        >
                          {getStatusIcon(peminjam.status)}
                          <span className="ml-1.5">
                            {getStatusText(peminjam.status)}
                            {peminjam.status === "rejected" &&
                              " (akan dihapus)"}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">
                          {formatWaktu(peminjam.created_at)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {peminjam.metode_konfirmasi || "whatsapp"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleInspect(peminjam)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                            title="Detail Peminjaman"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContact(peminjam.telepon)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                            title="Hubungi via WhatsApp"
                            disabled={!peminjam.telepon}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          {peminjam.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(peminjam.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                                title="Setujui Peminjaman"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(peminjam.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                title="Tolak Peminjaman"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Timeline Dropdown untuk peminjaman yang disetujui */}
                    {peminjam.status === "approved" && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <TimelineDropdown peminjam={peminjam} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {currentItems.map((peminjam) => (
                <div
                  key={peminjam.id}
                  className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
                >
                  {/* Header dengan gambar dan info utama */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {peminjam.barang?.gambar ? (
                        <img
                          src={peminjam.barang.gambar}
                          alt={peminjam.barang.nama}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {peminjam.nama_lengkap || "-"}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            peminjam.status
                          )}`}
                        >
                          {getStatusText(peminjam.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        NIM: {peminjam.nim || "-"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {peminjam.barang?.nama || "Barang tidak ditemukan"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {peminjam.jumlah_pinjam || 0} unit •{" "}
                        {peminjam.instansi || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Info Tambahan */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span>{formatTanggal(peminjam.tanggal_mulai)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-green-500" />
                      <span>{formatTanggal(peminjam.tanggal_selesai)}</span>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-gray-900">
                        {formatRupiah(peminjam.total_biaya)}
                      </p>
                      <p className="text-gray-500">
                        {peminjam.lama_pinjam || 0} hari
                      </p>
                    </div>
                  </div>

                  {/* Timeline untuk yang approved */}
                  {peminjam.status === "approved" && (
                    <div className="mb-3">
                      <TimelineDropdown peminjam={peminjam} />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInspect(peminjam)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleContact(peminjam.telepon)}
                        disabled={!peminjam.telepon}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>

                    {peminjam.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(peminjam.id)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(peminjam.id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Waktu Konfirmasi */}
                  <div className="mt-2 text-xs text-gray-500">
                    {formatWaktu(peminjam.created_at)}
                  </div>
                </div>
              ))}
            </div>

            {currentItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  Tidak ada data peminjam
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== "semua"
                    ? "Coba ubah pencarian atau filter"
                    : "Belum ada peminjaman yang tercatat"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredPeminjam.length)} dari{" "}
                  {filteredPeminjam.length}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
                        {selectedPeminjam.nama_lengkap || "-"}
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

                {/* Timeline Section dalam Modal */}
                {selectedPeminjam.status === "approved" && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span>Tracking Peminjaman</span>
                    </h4>
                    <TimelineDropdown peminjam={selectedPeminjam} />
                  </div>
                )}

                {/* Informasi Barang */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span>Informasi Barang</span>
                  </h4>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {selectedPeminjam.barang?.gambar ? (
                        <img
                          src={selectedPeminjam.barang.gambar}
                          alt={selectedPeminjam.barang.nama}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedPeminjam.barang?.nama ||
                          "Barang tidak ditemukan"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Jumlah: {selectedPeminjam.jumlah_pinjam || 0} unit
                      </p>
                      <p className="text-sm text-gray-600">
                        Harga: {formatRupiah(selectedPeminjam.barang?.harga)}
                        /hari
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
                        {formatTanggal(selectedPeminjam.tanggal_mulai)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Selesai</p>
                      <p className="font-medium text-gray-900">
                        {formatTanggal(selectedPeminjam.tanggal_selesai)}
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
                        {formatRupiah(selectedPeminjam.total_biaya)}
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

      {/* Modal Konfirmasi Kondisi Barang */}
      {showKondisiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Konfirmasi Kondisi Barang
                </h3>
                <button
                  onClick={() => setShowKondisiModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kondisi Barang Kembali
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "baik", label: "Baik", color: "text-green-600" },
                      {
                        value: "rusak_ringan",
                        label: "Rusak Ringan",
                        color: "text-yellow-600",
                      },
                      {
                        value: "rusak_berat",
                        label: "Rusak Berat",
                        color: "text-red-600",
                      },
                    ].map((kondisi) => (
                      <label
                        key={kondisi.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="kondisi"
                          value={kondisi.value}
                          checked={kondisiKembali === kondisi.value}
                          onChange={(e) => setKondisiKembali(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm font-medium ${kondisi.color}`}
                        >
                          {kondisi.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(kondisiKembali === "rusak_ringan" ||
                  kondisiKembali === "rusak_berat") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Denda (Rp)
                    </label>
                    <input
                      type="number"
                      value={denda}
                      onChange={(e) => setDenda(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan jumlah denda"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Admin
                  </label>
                  <textarea
                    value={catatanAdmin}
                    onChange={(e) => setCatatanAdmin(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tambahkan catatan mengenai kondisi barang..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowKondisiModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors duration-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSelesaikanPeminjaman}
                    disabled={timelineLoading[selectedPeminjamanId]}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    {timelineLoading[selectedPeminjamanId] ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyelesaikan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Selesaikan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPeminjam;
