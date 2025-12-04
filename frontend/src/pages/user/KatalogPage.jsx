import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Share2, 
  ArrowUpDown, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import katalogAPI from '../../api/katalogAPI';

const KatalogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [priceSort, setPriceSort] = useState('termurah');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data dari backend
  const loadBarangData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await katalogAPI.getAll();
      console.log('📦 Data dari API:', response);

      setBarangData(response || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarangData();
  }, []);

  // Filter dan sort data
  const filteredBarang = Array.isArray(barangData) 
    ? barangData
        .filter(barang => {
          if (!barang) return false;
          
          const matchesSearch = barang.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             barang.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === 'semua' || barang.kategori === selectedCategory;
          const matchesStatus = statusFilter === 'semua' || barang.status === statusFilter;
          
          return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
          if (priceSort === 'termurah') {
            return a.harga - b.harga;
          } else {
            return b.harga - a.harga;
          }
        })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceSort, statusFilter]);

  // Helper function untuk mendapatkan gambar utama
  const getGambarUtama = (barang) => {
    if (!barang.gambar || !Array.isArray(barang.gambar)) return null;
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

  const handlePinjam = (barangId, e) => {
    e.stopPropagation();
    navigate(`/pinjam/${barangId}`);
  };

  const handleDetail = (barangId) => {
    navigate(`/katalog/${barangId}`);
  };

  const handleRefresh = () => {
    loadBarangData();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBarangData();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('semua');
    setPriceSort('termurah');
    setStatusFilter('semua');
    setCurrentPage(1);
    loadBarangData();
  };

  const getStatusColor = (status) => {
    return status === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status) => {
    return status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia';
  };

  const getKualitasColor = (kualitas) => {
    switch (kualitas) {
      case 'Sangat Bagus': return 'text-green-600 bg-green-50';
      case 'Bagus': return 'text-blue-600 bg-blue-50';
      case 'Baik': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  if (loading && barangData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Katalog Barang</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan berbagai perlengkapan outdoor dan indoor untuk kebutuhan aktivitas Anda
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Search Bar */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="semua">Semua Status</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="tidak_tersedia">Tidak Tersedia</option>
                </select>
              </div>

              {/* Refresh Button */}
              <div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Price Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Urutkan Harga
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPriceSort('termurah')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      priceSort === 'termurah' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Termurah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceSort('termahal')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      priceSort === 'termahal' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Termahal</span>
                  </button>
                </div>
              </div>

              {/* Results Count and Actions */}
              <div className="flex items-center justify-between">
                <div className="text-slate-600">
                  Menampilkan {filteredBarang.length} barang
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-300"
                  >
                    Reset Filter
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentItems.map((barang) => {
                const gambarUtama = getGambarUtama(barang);
                const isTersedia = barang.status === 'tersedia';
                
                return (
                  <div
                    key={barang.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer ${
                      !isTersedia ? 'opacity-90' : ''
                    }`}
                    onClick={() => handleDetail(barang.id)}
                  >
                    {/* Image - Tetap ditampilkan walaupun tidak tersedia */}
                    <div className="relative overflow-hidden">
                      {gambarUtama ? (
                        <img
                          src={gambarUtama}
                          alt={barang.nama}
                          className={`w-full h-48 object-cover transition-transform duration-300 ${
                            isTersedia ? 'group-hover:scale-105' : 'grayscale'
                          }`}
                          onError={(e) => {
                            console.error('Error loading image:', gambarUtama);
                            e.target.src = '/images';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(barang.status)}`}>
                          {getStatusText(barang.status)}
                        </span>
                      </div>
                      
                      {/* Overlay untuk barang tidak tersedia - lebih transparan */}
                      {!isTersedia && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg">
                            <span className="text-sm font-semibold text-red-600 flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Sedang Dipinjam</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Title and Category */}
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mb-2">
                          {barang.kategori?.toUpperCase() || 'INDOOR'}
                        </span>
                        <h3 className={`text-xl font-bold line-clamp-1 transition-colors duration-300 ${
                          isTersedia 
                            ? 'text-slate-800 hover:text-blue-600' 
                            : 'text-slate-600'
                        }`}>
                          {barang.nama}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {barang.deskripsi}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>Maks {barang.maks_peminjaman}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Stok:</span> {barang.stok}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{barang.lokasi}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${getKualitasColor(barang.kualitas)}`}>
                            {barang.kualitas}
                          </span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-2xl font-bold ${
                            isTersedia ? 'text-slate-800' : 'text-slate-500'
                          }`}>
                            {formatRupiah(barang.harga)}
                          </span>
                          <span className="text-slate-500 text-sm block">/hari</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleShare(barang, e)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all duration-300 hover:scale-105"
                            title="Bagikan"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handlePinjam(barang.id, e)}
                            disabled={!isTersedia}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                              isTersedia
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isTersedia ? 'Pinjam' : 'Tidak Tersedia'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {currentItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Barang tidak ditemukan</h3>
                <p className="text-slate-500 mb-6">
                  Coba ubah filter pencarian atau kata kunci yang berbeda
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && currentItems.length > 0 && (
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
                <div className="text-slate-600 text-sm">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBarang.length)} dari {filteredBarang.length} barang
                  <span className="text-slate-400 ml-2">(6 barang per halaman)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-slate-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KatalogPage;