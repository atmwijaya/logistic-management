import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Share2,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  EyeOff,
  MoreVertical,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import katalogAPI from "../../api/katalogAPI";

const KatalogAdminPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [layoutMode, setLayoutMode] = useState("grid");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Load data dari backend
  const loadBarangData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await katalogAPI.getAll();
      console.log("📦 Data dari API:", response);

      // Supabase langsung return array, tidak perlu response.data
      setBarangData(response || []);
    } catch (err) {
      setError(err.message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarangData();
  }, []);

  // Filter barang (client-side untuk real-time filtering)
  const filteredBarang = Array.isArray(barangData)
    ? barangData.filter((barang) => {
        if (!barang) return false;

        const matchesSearch =
          barang.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barang.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "semua" || barang.kategori === selectedCategory;
        const matchesStatus =
          statusFilter === "semua" || barang.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
    : [];

  const getStatusColor = (status) => {
    return status === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = (status) => {
    return status === "tersedia" ? "Tersedia" : "Tidak Tersedia";
  };

  const getKualitasColor = (kualitas) => {
    switch (kualitas) {
      case "Sangat Bagus":
        return "text-green-600 bg-green-50";
      case "Bagus":
        return "text-blue-600 bg-blue-50";
      case "Baik":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Helper function untuk mendapatkan gambar utama
  const getGambarUtama = (barang) => {
    if (!barang.gambar || !Array.isArray(barang.gambar)) return null;
    if (barang.gambar.length > 0 && typeof barang.gambar[0] === "string") {
      return barang.gambar[0];
    }
    return null;
  };

  const toKebabCase = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleShare = async (barang, e) => {
    e.stopPropagation();
    try {
      const baseUrl = window.location.origin;
      const barangSlug = toKebabCase(barang.nama);
      const shareUrl = `${baseUrl}/barang/${barangSlug}`;
      const shareData = {
        title: `Pinjam ${barang.nama} - Racana Diponegoro`,
        text: `Lihat ${
          barang.nama
        } untuk dipinjam di Racana Diponegoro. ${barang.deskripsi?.substring(
          0,
          100
        )}...`,
        url: shareUrl,
      };

      // Cek apakah Web Share API didukung
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: salin ke clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      // Fallback manual jika semua gagal
      const baseUrl = window.location.origin;
      const barangSlug = toKebabCase(barang.nama);
      const shareUrl = `${baseUrl}/barang/${barangSlug}`;

      prompt("Salin link berikut:", shareUrl);
    }
  };

  const handleEdit = (barang) => {
    navigate(`/admin/editkatalog/${barang.id}`);
  };

  const handleDelete = (barang) => {
    setSelectedBarang(barang);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await katalogAPI.delete(selectedBarang.id);
      setBarangData((prev) =>
        prev.filter((item) => item.id !== selectedBarang.id)
      );
      setShowDeleteModal(false);
      setSelectedBarang(null);
      alert("Barang berhasil dihapus!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNew = () => {
    navigate("/admin/createkatalog");
  };

  const handleDetail = (barangId) => {
    navigate(`/admin/detailkatalog/${barangId}`);
  };

  const toggleStatus = async (barangId, e) => {
    e.stopPropagation(); // Mencegah event bubbling

    try {
      setUpdatingStatus(barangId);
      const response = await katalogAPI.toggleStatus(barangId);

      // Update state dengan data terbaru
      setBarangData((prev) =>
        prev.map((item) =>
          item.id === barangId
            ? { ...item, status: response.data.status }
            : item
        )
      );

      alert(
        `Status berhasil diubah menjadi ${
          response.data.status === "tersedia" ? "Tersedia" : "Tidak Tersedia"
        }`
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRefresh = () => {
    loadBarangData();
  };

  if (loading && barangData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data barang...</p>
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
                Kelola Katalog Barang
              </h1>
              <p className="text-gray-600">
                Kelola semua barang inventaris Racana Diponegoro
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Barang</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="semua">Semua Kategori</option>
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="tidak_tersedia">Tidak Tersedia</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLayoutMode("grid")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  layoutMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLayoutMode("list")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  layoutMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">
              Menampilkan {filteredBarang.length} barang
            </span>
            {loading && (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            )}
          </div>
        </div>

        {/* Grid Layout */}
        {layoutMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredBarang.map((barang) => {
              const gambarUtama = getGambarUtama(barang);

              return (
                <div
                  key={barang.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer"
                  onClick={() => handleDetail(barang.id)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    {gambarUtama ? (
                      <img
                        src={gambarUtama}
                        alt={barang.nama}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error("Error loading image:", gambarUtama);
                          e.target.src = "/images";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          barang.status
                        )}`}
                      >
                        {getStatusText(barang.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title and Category */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mb-2">
                        {barang.kategori?.toUpperCase() || "INDOOR"}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                        {barang.nama}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {barang.deskripsi}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">Stok:</span>{" "}
                        {barang.stok}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">Maks:</span>{" "}
                        {barang.maks_peminjaman}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getKualitasColor(
                            barang.kualitas
                          )}`}
                        >
                          {barang.kualitas}
                        </span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-800">
                          {formatRupiah(barang.harga)}
                        </span>
                        <span className="text-gray-500 text-sm block">
                          /hari
                        </span>
                      </div>
                      <div
                        className="flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleShare(barang, e)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300"
                          title="Bagikan"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(barang)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(barang)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List Layout */}
        {layoutMode === "list" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Barang
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Kategori
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Stok
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Harga
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBarang.map((barang) => {
                  const gambarUtama = getGambarUtama(barang);

                  return (
                    <tr key={barang.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          {gambarUtama ? (
                            <img
                              src={gambarUtama}
                              alt={barang.nama}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = "/images";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {barang.nama}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {barang.deskripsi}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                          {barang.kategori?.toUpperCase() || "INDOOR"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {/* Toggle Switch untuk Status */}
                          <button
                            onClick={(e) => toggleStatus(barang.id, e)}
                            disabled={updatingStatus === barang.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              barang.status === "tersedia"
                                ? "bg-green-600"
                                : "bg-gray-200"
                            } ${
                              updatingStatus === barang.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                barang.status === "tersedia"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              barang.status
                            )}`}
                          >
                            {updatingStatus === barang.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              getStatusText(barang.status)
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {barang.stok}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(barang.harga)}
                        </span>
                        <span className="text-gray-500 text-sm block">
                          /hari
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleShare(barang, e)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                            title="Bagikan"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(barang)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(barang)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBarang.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada barang yang ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {filteredBarang.length === 0 && layoutMode === "grid" && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-gray-500 mb-6">
              Coba ubah filter pencarian atau tambah barang baru
            </p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              Tambah Barang Baru
            </button>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredBarang.map((barang) => {
          const gambarUtama = getGambarUtama(barang);

          return (
            <div
              key={barang.id}
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
            >
              {/* Header dengan gambar dan info */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {gambarUtama ? (
                    <img
                      src={gambarUtama}
                      alt={barang.nama}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mb-1">
                        {barang.kategori?.toUpperCase() || "INDOOR"}
                      </span>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {barang.nama}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        barang.status
                      )}`}
                    >
                      {getStatusText(barang.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {barang.deskripsi}
                  </p>
                </div>
              </div>

              {/* Stats Info */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{barang.stok}</p>
                  <p className="text-gray-500">Stok</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {barang.maks_peminjaman}
                  </p>
                  <p className="text-gray-500">Maks</p>
                </div>
                <div className="text-center">
                  <p
                    className={`px-2 py-1 rounded-full ${getKualitasColor(
                      barang.kualitas
                    )}`}
                  >
                    {barang.kualitas}
                  </p>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {formatRupiah(barang.harga)}
                  </p>
                  <p className="text-xs text-gray-500">/hari</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(barang, e);
                    }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(barang);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(barang);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggle Status Button */}
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Status Tersedia:</span>
                <button
                  onClick={(e) => toggleStatus(barang.id, e)}
                  disabled={updatingStatus === barang.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    barang.status === "tersedia"
                      ? "bg-green-600"
                      : "bg-gray-200"
                  } ${
                    updatingStatus === barang.id
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      barang.status === "tersedia"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}

        {filteredBarang.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Coba ubah filter pencarian atau tambah barang baru
            </p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Tambah Barang Baru
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hapus Barang
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{selectedBarang?.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-300"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KatalogAdminPage;
