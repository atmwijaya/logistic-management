import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  CheckCircle,
  Truck,
  Package,
  RefreshCw
} from 'lucide-react';
import katalogAPI from '../../api/katalogAPI';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [barangDetail, setBarangDetail] = useState(null);
  const [relatedBarang, setRelatedBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBarangDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await katalogAPI.getById(id);
        console.log('Barang Detail:', response); 
        setBarangDetail(response);

        const relatedResponse = await katalogAPI.getAll();
        const filteredRelated = Array.isArray(relatedResponse) 
          ? relatedResponse.filter(item => item.id !== id && item.kategori === response.kategori).slice(0, 3)
          : [];
        setRelatedBarang(filteredRelated);
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

  const getGambarUtama = (barang) => {
    if (!barang || !barang.gambar || !Array.isArray(barang.gambar)) return null;
    if (barang.gambar.length > 0 && typeof barang.gambar[0] === 'string') {
      return barang.gambar[0];
    }
    return null;
  };

  const handleShare = async (barang, e) => {
  e.stopPropagation();
  try {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/katalog/${barang.id}`;
    const shareData = {
      title: `Pinjam ${barang.nama} - Racana Diponegoro`,
      text: `Lihat ${barang.nama} untuk dipinjam di Racana Diponegoro. ${barang.deskripsi?.substring(0, 100)}...`,
      url: shareUrl
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link berhasil disalin ke clipboard!');
    }
  } catch (err) {
    console.error('Error sharing:', err);
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/katalog/${barang.id}`;
    prompt('Salin link berikut:', shareUrl);
  }
  };

  const handlePinjam = () => {
    navigate(`/pinjam/${barangDetail.id}`);
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

  const renderSpesifikasi = () => {
    if (!barangDetail.spesifikasi || !Array.isArray(barangDetail.spesifikasi)) {
      return null;
    }

    return barangDetail.spesifikasi.map((spec, index) => {
      if (typeof spec === 'string') {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-600">{spec}</span>
          </div>
        );
      }
      
      if (spec && typeof spec === 'object' && spec.nama && spec.nilai) {
        return (
          <div key={spec.id || index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-600">
              <strong>{spec.nama}:</strong> {spec.nilai}
            </span>
          </div>
        );
      }
      
      if (spec && typeof spec === 'object') {
        return (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-slate-600">
              {Object.values(spec).join(' - ')}
            </span>
          </div>
        );
      }

      return null;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail barang...</p>
        </div>
      </div>
    );
  }

  if (error || !barangDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-300 mb-6"
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
              onClick={() => navigate('/katalog')}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Katalog</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {gambarUtama ? (
                <img
                  src={gambarUtama}
                  alt={barangDetail.nama}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src = '/images';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {barangDetail.gambar && barangDetail.gambar.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {barangDetail.gambar.map((gambar, index) => {
                  const gambarUrl = typeof gambar === 'string' ? gambar : gambar.url;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index ? 'border-blue-500 scale-105' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={gambarUrl}
                        alt={`${barangDetail.nama} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = '/images';
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
                    {barangDetail.kategori?.toUpperCase() || 'BARANG'}
                  </span>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {barangDetail.nama}
                  </h1>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-4 mb-6">
                <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(barangDetail.status)}`}>
                  {getStatusText(barangDetail.status)}
                </span>
                <span className="text-slate-600">
                  Stok: <strong>{barangDetail.stok} unit</strong>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-4xl font-bold text-slate-800">
                  {formatRupiah(barangDetail.harga)}
                </span>
                <span className="text-slate-500">/hari</span>
              </div>
              <p className="text-slate-600 text-sm">
                Minimum peminjaman 1 hari, maksimal {barangDetail.maks_peminjaman}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-slate-500">Kualitas</p>
                    <p className="font-semibold text-slate-800">{barangDetail.kualitas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-slate-500">Lokasi</p>
                    <p className="font-semibold text-slate-800">{barangDetail.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={(e) => handleShare(barangDetail, e)}
                className="flex-1 bg-white border border-slate-300 text-slate-700 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Bagikan</span>
              </button>
              <button
                onClick={handlePinjam}
                disabled={barangDetail.status !== 'tersedia'}
                className={`flex-1 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  barangDetail.status === 'tersedia'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Pinjam Sekarang</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Informasi Penting</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Pengambilan barang di {barangDetail.lokasi}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Maksimal peminjaman {barangDetail.maks_peminjaman}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>DP 50% diperlukan untuk pemesanan</span>
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
              <h2 className="text-xl font-bold text-slate-800 mb-4">Deskripsi Barang</h2>
              <p className="text-slate-600 leading-relaxed">
                {barangDetail.deskripsi}
              </p>
              {barangDetail.catatan && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">
                    <strong>Catatan:</strong> {barangDetail.catatan}
                  </p>
                </div>
              )}
            </div>

            {/* Specifications */}
            {barangDetail.spesifikasi && Array.isArray(barangDetail.spesifikasi) && barangDetail.spesifikasi.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Spesifikasi Teknis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSpesifikasi()}
                </div>
              </div>
            )}
          </div>

          {/* Related Products */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Barang Terkait</h2>
            <div className="space-y-4">
              {relatedBarang.map((barang) => {
                const relatedGambar = getGambarUtama(barang);
                return (
                  <div
                    key={barang.id}
                    className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/katalog/${barang.id}`)}
                  >
                    <div className="flex space-x-4">
                      {relatedGambar ? (
                        <img
                          src={relatedGambar}
                          alt={barang.nama}
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = '/images';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 line-clamp-2">
                          {barang.nama}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-slate-800">
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;