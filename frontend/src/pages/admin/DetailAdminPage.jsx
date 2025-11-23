import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  Users,
  MapPin,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Truck,
  Share2,
  RefreshCw,
} from "lucide-react";
import katalogAPI from "../../api/katalogAPI";

const DetailAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [barangDetail, setBarangDetail] = useState(null);
  const [relatedBarang, setRelatedBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data barang detail dari backend
  useEffect(() => {
    const loadBarangDetail = async () => {
      try {
        setLoading(true);
        setError("");

        // Load detail barang
        const response = await katalogAPI.getById(id);
        console.log("Barang Detail Admin:", response); // Debug log
        setBarangDetail(response);

        // Load related barang
        const relatedResponse = await katalogAPI.getAll();
        const filteredRelated = Array.isArray(relatedResponse)
          ? relatedResponse
              .filter(
                (item) => item.id !== id && item.kategori === response.kategori
              )
              .slice(0, 3)
          : [];
        setRelatedBarang(filteredRelated);
      } catch (err) {
        setError(err.message);
        console.error("Error loading barang detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBarangDetail();
    }
  }, [id]);

  // Helper function untuk mendapatkan gambar utama
  const getGambarUtama = (barang) => {
    if (!barang || !barang.gambar || !Array.isArray(barang.gambar)) return null;
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

  const handleShare = async (e) => {
    e.stopPropagation();

    if (!barangDetail) {
      console.error("Data barang tidak tersedia untuk sharing");
      alert("Data barang tidak tersedia");
      return;
    }

    try {
      const baseUrl = window.location.origin;
      const barangSlug = toKebabCase(barangDetail.nama);
      const shareUrl = `${baseUrl}/barang/${barangSlug}`;
      const shareData = {
        title: `Pinjam ${barangDetail.nama} - Racana Diponegoro`,
        text: `Lihat ${
          barangDetail.nama
        } untuk dipinjam di Racana Diponegoro. ${barangDetail.deskripsi?.substring(
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
      const barangSlug = toKebabCase(barangDetail.nama);
      const shareUrl = `${baseUrl}/barang/${barangSlug}`;

      prompt("Salin link berikut:", shareUrl);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/editkatalog/${barangDetail.id}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await katalogAPI.delete(barangDetail.id);
      alert("Barang berhasil dihapus!");
      navigate("/admin/daftarkatalog");
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async () => {
    try {
      const response = await katalogAPI.toggleStatus(barangDetail.id);
      setBarangDetail(response);
      alert(
        `Status berhasil diubah menjadi ${
          response.status === "tersedia" ? "Tersedia" : "Tidak Tersedia"
        }`
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const getStatusColor = (status) => {
    return status === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = (status) => {
    return status === "tersedia" ? "Tersedia" : "Tidak Tersedia";
  };

  // Fungsi untuk menangani spesifikasi (bisa berupa array of strings atau array of objects)
  const renderSpesifikasi = () => {
    if (!barangDetail.spesifikasi || !Array.isArray(barangDetail.spesifikasi)) {
      return null;
    }

    return barangDetail.spesifikasi.map((spec, index) => {
      // Jika spesifikasi adalah string langsung
      if (typeof spec === "string") {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">{spec}</span>
          </div>
        );
      }

      // Jika spesifikasi adalah object dengan properti 'nama' dan 'nilai'
      if (spec && typeof spec === "object" && spec.nama && spec.nilai) {
        return (
          <div key={spec.id || index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">
              <strong>{spec.nama}:</strong> {spec.nilai}
            </span>
          </div>
        );
      }

      // Jika spesifikasi adalah object dengan properti lain
      if (spec && typeof spec === "object") {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">
              {Object.values(spec).join(" - ")}
            </span>
          </div>
        );
      }

      return null;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail barang...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !barangDetail) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/admin/daftarkatalog")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Katalog</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Barang Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Barang yang Anda cari tidak ditemukan."}
            </p>
            <button
              onClick={() => navigate("/admin/daftarkatalog")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const gambarUtama = getGambarUtama(barangDetail);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/daftarkatalog")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 self-start"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Katalog</span>
          </button>

          {/* Admin Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                barangDetail.status === "tersedia"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {barangDetail.status === "tersedia"
                ? "Set Tidak Tersedia"
                : "Set Tersedia"}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
                title="Bagikan"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-300"
                title="Edit Barang"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300"
                title="Hapus Barang"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Action */}
          <div className="flex md:hidden items-center justify-between w-full bg-white rounded-2xl shadow-lg p-4">
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
                title="Bagikan"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-300"
                title="Edit Barang"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                barangDetail.status === "tersedia"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {barangDetail.status === "tersedia"
                ? "Tidak Tersedia"
                : "Tersedia"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {gambarUtama ? (
                <img
                  src={gambarUtama}
                  alt={barangDetail.nama}
                  className="w-full h-64 md:h-96 object-cover"
                  onError={(e) => {
                    e.target.src = "/images";
                  }}
                />
              ) : (
                <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {barangDetail.gambar && barangDetail.gambar.length > 1 && (
              <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2">
                {barangDetail.gambar.map((gambar, index) => {
                  const gambarUrl =
                    typeof gambar === "string" ? gambar : gambar.url;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                        selectedImage === index
                          ? "border-blue-500 scale-105"
                          : "border-transparent"
                      }`}
                      style={{ minWidth: "80px" }}
                    >
                      <img
                        src={gambarUrl}
                        alt={`${barangDetail.nama} ${index + 1}`}
                        className="w-20 h-20 object-cover"
                        onError={(e) => {
                          e.target.src = "/images";
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {barangDetail.kategori?.toUpperCase() || "BARANG"}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {barangDetail.nama}
                  </h1>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 text-sm">
                  {barangDetail.total_dipinjam || 0}x dipinjam
                </span>
              </div>

              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <span
                  className={`px-4 py-2 rounded-full font-medium ${getStatusColor(
                    barangDetail.status
                  )}self-start`}
                >
                  {getStatusText(barangDetail.status)}
                </span>
                <span className="text-gray-600 text-sm">
                  Stok: <strong>{barangDetail.stok} unit</strong>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3x1 md:text-4xl font-bold text-gray-800">
                  {formatRupiah(barangDetail.harga)}
                </span>
                <span className="text-gray-500 text-sm md:text-base">
                  /hari
                </span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm">
                Minimum peminjaman 1 hari, maksimal{" "}
                {barangDetail.maks_peminjaman}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white rounded-2xl p-3 md:p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Kualitas</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                      {barangDetail.kualitas}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-3 md:p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                      {barangDetail.lokasi}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons - Mobile Stack */}
            <div className="flex flex-col space-y-3 md:hidden">
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Barang</span>
              </button>
              <button
                onClick={toggleStatus}
                className={`py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  barangDetail.status === "tersedia"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {barangDetail.status === "tersedia"
                    ? "Set Tidak Tersedia"
                    : "Set Tersedia"}
                </span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm md:text-base">Informasi Admin</span>
              </h3>
              <ul className="space-y-2 text-xs md:text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Pengambilan barang di {barangDetail.lokasi}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Maksimal peminjaman {barangDetail.maks_peminjaman}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Total dipinjam: {barangDetail.total_dipinjam || 0} kali
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">
                    Dibuat:{" "}
                    {new Date(barangDetail.created_at).toLocaleDateString(
                      "id-ID"
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description & Specifications Desktop */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Deskripsi Barang
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {barangDetail.deskripsi}
              </p>
              {barangDetail.catatan && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600">
                    <strong>Catatan Admin:</strong> {barangDetail.catatan}
                  </p>
                </div>
              )}
            </div>

            {/* Specifications */}
            {barangDetail.spesifikasi &&
              Array.isArray(barangDetail.spesifikasi) &&
              barangDetail.spesifikasi.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                    Spesifikasi Teknis
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {renderSpesifikasi()}
                  </div>
                </div>
              )}
          </div>

          {/* Related Products & Quick Actions - Mobile Bottom */}
          <div className="space-y-6">
            {/* Quick Actions - Mobile Hidden (sudah ada di atas) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Aksi Cepat
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Barang</span>
                </button>
                <button
                  onClick={toggleStatus}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    barangDetail.status === "tersedia"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {barangDetail.status === "tersedia"
                      ? "Set Tidak Tersedia"
                      : "Set Tersedia"}
                  </span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Barang</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Barang Terkait
              </h2>
              <div className="space-y-3 md:space-y-4">
                {relatedBarang.map((barang) => {
                  const relatedGambar = getGambarUtama(barang);
                  return (
                    <div
                      key={barang.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-300"
                      onClick={() =>
                        navigate(`/admin/detailkatalog/${barang.id}`)
                      }
                    >
                      {relatedGambar ? (
                        <img
                          src={relatedGambar}
                          alt={barang.nama}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/images";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm md:text-base line-clamp-1">
                          {barang.nama}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs md:text-sm font-semibold text-gray-800">
                            {formatRupiah(barang.harga)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              barang.status === "tersedia"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {barang.status === "tersedia"
                              ? "Tersedia"
                              : "Dipinjam"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {relatedBarang.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Tidak ada barang terkait
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
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
              <strong>{barangDetail.nama}</strong>? Tindakan ini tidak dapat
              dibatalkan dan semua data peminjaman terkait akan terpengaruh.
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

      {/* Delete Button - Mobile Only */}
      <div className="md:hidden">
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Trash2 className="w-5 h-5" />
          <span>Hapus Barang</span>
        </button>
      </div>
    </div>
  );
};

export default DetailAdminPage;
