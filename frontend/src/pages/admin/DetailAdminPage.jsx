import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Eye,
  MoreVertical,
  Share2,
  RefreshCw
} from 'lucide-react';

const DetailAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [barangDetail, setBarangDetail] = useState(null);
  const [relatedBarang, setRelatedBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data barang detail dari backend
  useEffect(() => {
    const loadBarangDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load detail barang
        const response = await katalogAPI.getById(id);
        console.log('Barang Detail Admin:', response.data); // Debug log
        setBarangDetail(response.data);

        // Load related barang
        const relatedResponse = await katalogAPI.getAll({ 
          kategori: response.data.kategori,
          limit: 3 
        });
        setRelatedBarang(relatedResponse.data.filter(item => item._id !== id));
      } catch (err) {
        setError(err.message);
        console.error('Error loading barang detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBarangDetail();
    }
  }, [id]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/barang/${barangDetail._id}`;
    if (navigator.share) {
      navigator.share({
        title: barangDetail.nama,
        text: barangDetail.deskripsi,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link berhasil disalin!');
      });
    }
  };

  const handleEdit = () => {
    navigate(`/admin/editkatalog/${barangDetail._id}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await katalogAPI.delete(barangDetail._id);
      alert('Barang berhasil dihapus!');
      navigate('/admin/daftarkatalog');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async () => {
    try {
      const response = await katalogAPI.toggleStatus(barangDetail._id);
      setBarangDetail(response.data);
      alert(`Status berhasil diubah menjadi ${response.data.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const getStatusColor = (status) => {
    return status === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status) => {
    return status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia';
  };

  // Fungsi untuk menangani spesifikasi (bisa berupa array of strings atau array of objects)
  const renderSpesifikasi = () => {
    if (!barangDetail.spesifikasi || !Array.isArray(barangDetail.spesifikasi)) {
      return null;
    }

    return barangDetail.spesifikasi.map((spec, index) => {
      // Jika spesifikasi adalah string langsung
      if (typeof spec === 'string') {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">{spec}</span>
          </div>
        );
      }
      
      // Jika spesifikasi adalah object dengan properti 'nama' dan 'nilai'
      if (spec && typeof spec === 'object' && spec.nama && spec.nilai) {
        return (
          <div key={spec._id || index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">
              <strong>{spec.nama}:</strong> {spec.nilai}
            </span>
          </div>
        );
      }
      
      // Jika spesifikasi adalah object dengan properti lain
      if (spec && typeof spec === 'object') {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">
              {Object.values(spec).join(' - ')}
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
            onClick={() => navigate('/admin/daftarkatalog')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Katalog</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Barang Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">{error || 'Barang yang Anda cari tidak ditemukan.'}</p>
            <button
              onClick={() => navigate('/admin/daftarkatalog')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/daftarkatalog')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Katalog</span>
          </button>

          {/* Admin Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                barangDetail.status === 'tersedia'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {barangDetail.status === 'tersedia' ? 'Set Tidak Tersedia' : 'Set Tersedia'}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={barangDetail.gambar && barangDetail.gambar.length > 0 
                  ? `http://localhost:5000${barangDetail.gambar[selectedImage]?.url || barangDetail.gambar[selectedImage]}`
                  : '/placeholder-image.jpg'
                }
                alt={barangDetail.nama}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {barangDetail.gambar && barangDetail.gambar.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {barangDetail.gambar.map((gambar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index ? 'border-blue-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${gambar?.url || gambar}`}
                      alt={`${barangDetail.nama} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
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
                    {barangDetail.kategori?.toUpperCase() || 'BARANG'}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {barangDetail.nama}
                  </h1>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-800">{barangDetail.rating || 4.5}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{barangDetail.totalUlasan || 0} ulasan</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{barangDetail.totalDipinjam || 0}x dipinjam</span>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-4 mb-6">
                <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(barangDetail.status)}`}>
                  {getStatusText(barangDetail.status)}
                </span>
                <span className="text-gray-600">
                  Stok: <strong>{barangDetail.stok} unit</strong>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-4xl font-bold text-gray-800">
                  {formatRupiah(barangDetail.harga)}
                </span>
                <span className="text-gray-500">/hari</span>
              </div>
              <p className="text-gray-600 text-sm">
                Minimum peminjaman 1 hari, maksimal {barangDetail.maksPeminjaman}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Kualitas</p>
                    <p className="font-semibold text-gray-800">{barangDetail.kualitas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="font-semibold text-gray-800">{barangDetail.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Barang</span>
              </button>
              <button
                onClick={toggleStatus}
                className={`flex-1 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  barangDetail.status === 'tersedia'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {barangDetail.status === 'tersedia' ? 'Set Tidak Tersedia' : 'Set Tersedia'}
                </span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Informasi Admin</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Pengambilan barang di {barangDetail.lokasi}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Maksimal peminjaman {barangDetail.maksPeminjaman}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Total dipinjam: {barangDetail.totalDipinjam || 0} kali</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Dibuat: {new Date(barangDetail.createdAt).toLocaleDateString('id-ID')} • Diupdate: {new Date(barangDetail.updatedAt).toLocaleDateString('id-ID')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Description & Specifications */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Deskripsi Barang</h2>
              <p className="text-gray-600 leading-relaxed">
                {barangDetail.deskripsi}
              </p>
              {barangDetail.catatan && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Catatan Admin:</strong> {barangDetail.catatan}
                  </p>
                </div>
              )}
            </div>

            {/* Specifications */}
            {barangDetail.spesifikasi && Array.isArray(barangDetail.spesifikasi) && barangDetail.spesifikasi.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Spesifikasi Teknis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSpesifikasi()}
                </div>
              </div>
            )}
          </div>

          {/* Related Products & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
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
                    barangDetail.status === 'tersedia'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {barangDetail.status === 'tersedia' ? 'Set Tidak Tersedia' : 'Set Tersedia'}
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Barang Terkait</h2>
              <div className="space-y-4">
                {relatedBarang.map((barang) => (
                  <div
                    key={barang._id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-300"
                    onClick={() => navigate(`/admin/katalog/detail/${barang._id}`)}
                  >
                    <img
                      src={barang.gambar && barang.gambar.length > 0 
                        ? `http://localhost:5000${barang.gambar[0]?.url || barang.gambar[0]}`
                        : '/placeholder-image.jpg'
                      }
                      alt={barang.nama}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 line-clamp-1">
                        {barang.nama}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatRupiah(barang.harga)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          barang.status === 'tersedia' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {barang.status === 'tersedia' ? 'Tersedia' : 'Dipinjam'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Barang</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{barangDetail.nama}</strong>? 
              Tindakan ini tidak dapat dibatalkan dan semua data peminjaman terkait akan terpengaruh.
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

export default DetailAdminPage;