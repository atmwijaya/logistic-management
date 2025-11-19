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
} from "lucide-react";
import peminjamanAPI from "../../api/peminjamanAPI";

const DaftarPeminjam = () => {
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
        setDaftarPeminjam(result.data || []);
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

  // Hapus filter lokal karena kita sudah menggunakan filter dari backend
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

  const handleApprove = async (id) => {
    try {
      setError("");
      console.log("🟢 APPROVING peminjaman with ID:", id);

      const result = await peminjamanAPI.updateStatus(id, "approved");

      console.log("🟢 APPROVE API RESULT:", result);

      // Handle different response formats
      if (result.success || result.data) {
        console.log("🟢 Update successful, updating UI...");

        // Immediate UI update
        setDaftarPeminjam((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "approved" } : item
          )
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

      const result = await peminjamanAPI.updateStatus(id, "rejected");

      console.log("🔴 REJECT API RESULT:", result);

      // Handle different response formats
      if (result.success || result.data) {
        console.log("🔴 Update successful, updating UI...");

        // Immediate UI update
        setDaftarPeminjam((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "rejected" } : item
          )
        );

        setSuccessMessage("Peminjaman berhasil ditolak");
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

  const handleInspect = (peminjam) => {
    setSelectedPeminjam(peminjam);
    setShowDetailModal(true);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Daftar Peminjam
              </h1>
              <p className="text-gray-600">
                Kelola konfirmasi peminjaman barang dari WhatsApp
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
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
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">
              Menampilkan {filteredPeminjam.length} peminjam
              {searchTerm && ` untuk "${searchTerm}"`}
              {statusFilter !== "semua" &&
                ` dengan status "${getStatusText(statusFilter)}"`}
            </span>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
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
                  <tr
                    key={peminjam.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
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
                            {peminjam.barang?.nama || "Barang tidak ditemukan"}
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
                ))}
              </tbody>
            </table>

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
    </div>
  );
};

export default DaftarPeminjam;