import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import riwayatAPI from '../../api/riwayatAPI';

const RiwayatPage = () => {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [kondisiFilter, setKondisiFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statistik, setStatistik] = useState(null);
  const [selectedRiwayat, setSelectedRiwayat] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    fetchRiwayat();
    fetchStatistik();
  }, [currentPage, itemsPerPage, statusFilter, kondisiFilter, searchTerm]);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'semua') params.status_akhir = statusFilter;
      if (kondisiFilter !== 'semua') params.kondisi_kembali = kondisiFilter;

      const result = await riwayatAPI.getAll(params);

      if (result.success) {
        setRiwayat(result.data || []);
      } else {
        setError(result.message || 'Gagal memuat data riwayat');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
      console.error('Error fetching riwayat:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistik = async () => {
    try {
      const result = await riwayatAPI.getStatistik();
      if (result.success) {
        setStatistik(result.data);
      }
    } catch (err) {
      console.error('Error fetching statistik:', err);
    }
  };

  // Filter data lokal (jika backend tidak handle filter)
  const filteredRiwayat = riwayat.filter(item =>
    (item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.nim?.includes(searchTerm) ||
     item.barang_nama?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'semua' || item.status_akhir === statusFilter) &&
    (kondisiFilter === 'semua' || item.kondisi_kembali === kondisiFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);

  // Format functions
  const formatRupiah = (angka) => {
    return riwayatAPI.utils.formatCurrency(angka);
  };

  const formatDate = (dateString) => {
    return riwayatAPI.utils.formatDate(dateString);
  };

  const formatDateTime = (dateString) => {
    return riwayatAPI.utils.formatDateTime(dateString);
  };

  const getStatusColor = (status) => {
    return riwayatAPI.utils.getStatusColor(status);
  };

  const getStatusText = (status) => {
    return riwayatAPI.utils.getStatusText(status);
  };

  const getKondisiColor = (kondisi) => {
    return riwayatAPI.utils.getKondisiColor(kondisi);
  };

  const getKondisiText = (kondisi) => {
    return riwayatAPI.utils.getKondisiText(kondisi);
  };

  const handleContact = (telepon) => {
    if (!telepon) {
      setError('Nomor telepon tidak tersedia');
      return;
    }
    const message = 'Halo! Mengenai riwayat peminjaman Anda...';
    const whatsappUrl = `https://wa.me/${telepon.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExport = async () => {
    try {
      setError('');
      const result = await riwayatAPI.exportData({
        search: searchTerm,
        status_akhir: statusFilter !== 'semua' ? statusFilter : undefined,
        kondisi_kembali: kondisiFilter !== 'semua' ? kondisiFilter : undefined
      });

      if (result.success) {
        setSuccessMessage('Data berhasil diexport');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || 'Gagal mengexport data');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat export data');
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter('semua');
    setKondisiFilter('semua');
    setCurrentPage(1);
    fetchRiwayat();
    fetchStatistik();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleKondisiFilterChange = (e) => {
    setKondisiFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (loading && riwayat.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat data riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Peminjaman</h1>
              <p className="text-gray-600">Data lengkap semua peminjaman yang telah selesai</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
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
              onClick={() => setError('')}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Statistik */}
        {statistik && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Peminjaman</p>
                  <p className="text-2xl font-bold text-gray-900">{statistik.totalPeminjaman}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(statistik.totalPendapatan)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Denda</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(statistik.totalDenda)}</p>
                </div>
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistik.selesai} / {statistik.totalPeminjaman}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
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
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Kondisi Filter */}
            <div>
              <select
                value={kondisiFilter}
                onChange={handleKondisiFilterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="semua">Semua Kondisi</option>
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">
              Menampilkan {filteredRiwayat.length} riwayat peminjaman
              {searchTerm && ` untuk "${searchTerm}"`}
              {statusFilter !== 'semua' && ` dengan status "${getStatusText(statusFilter)}"`}
              {kondisiFilter !== 'semua' && ` dengan kondisi "${getKondisiText(kondisiFilter)}"`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Peminjam & Barang</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Periode</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Biaya & Denda</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Waktu Selesai</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.barang_gambar ? (
                            <img
                              src={item.barang_gambar}
                              alt={item.barang_nama}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
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
                              {item.nama_lengkap || '-'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 mb-1 truncate">
                            NIM: {item.nim || '-'}
                          </p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.barang_nama || 'Barang tidak tersedia'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.jumlah_pinjam || 0} unit • {item.instansi || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                        <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>
                          {formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.lama_pinjam || 0} hari
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">
                        {formatRupiah(item.total_biaya)}
                      </p>
                      {item.denda > 0 && (
                        <p className="text-xs text-red-600">Denda: {formatRupiah(item.denda)}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status_akhir)}`}>
                          {getStatusText(item.status_akhir)}
                        </span>
                        {item.kondisi_kembali && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getKondisiColor(item.kondisi_kembali)}`}>
                            {getKondisiText(item.kondisi_kembali)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">
                        {formatDateTime(item.completed_at)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedRiwayat(item);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          title="Detail Riwayat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleContact(item.telepon)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                          title="Hubungi via WhatsApp"
                          disabled={!item.telepon}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
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
                  Tidak ada data riwayat peminjaman
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== 'semua' || kondisiFilter !== 'semua'
                    ? 'Coba ubah pencarian atau filter'
                    : 'Belum ada riwayat peminjaman yang tercatat'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRiwayat.length)} dari {filteredRiwayat.length}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
      {showDetailModal && selectedRiwayat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detail Riwayat Peminjaman</h3>
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
                      <p className="font-medium text-gray-900">{selectedRiwayat.nama_lengkap || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">NIM</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.nim || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jurusan</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.jurusan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instansi</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.instansi || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telepon</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.telepon || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.email || '-'}</p>
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
                      {selectedRiwayat.barang_gambar ? (
                        <img
                          src={selectedRiwayat.barang_gambar}
                          alt={selectedRiwayat.barang_nama}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedRiwayat.barang_nama || 'Barang tidak tersedia'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Jumlah: {selectedRiwayat.jumlah_pinjam || 0} unit
                      </p>
                      <p className="text-sm text-gray-600">
                        Harga: {formatRupiah(selectedRiwayat.barang_harga)}/hari
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
                      <p className="font-medium text-gray-900">{formatDate(selectedRiwayat.tanggal_mulai)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Selesai</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedRiwayat.tanggal_selesai)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lama Pinjam</p>
                      <p className="font-medium text-gray-900">{selectedRiwayat.lama_pinjam || 0} hari</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Biaya</p>
                      <p className="font-medium text-gray-900">{formatRupiah(selectedRiwayat.total_biaya)}</p>
                    </div>
                    {selectedRiwayat.denda > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Denda</p>
                        <p className="font-medium text-red-600">{formatRupiah(selectedRiwayat.denda)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Status Akhir</p>
                      <p className={`font-medium ${
                        selectedRiwayat.status_akhir === 'selesai' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getStatusText(selectedRiwayat.status_akhir)}
                      </p>
                    </div>
                    {selectedRiwayat.kondisi_kembali && (
                      <div>
                        <p className="text-sm text-gray-600">Kondisi Kembali</p>
                        <p className={`font-medium ${
                          selectedRiwayat.kondisi_kembali === 'baik' ? 'text-blue-600' :
                          selectedRiwayat.kondisi_kembali === 'rusak_ringan' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getKondisiText(selectedRiwayat.kondisi_kembali)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catatan */}
                {selectedRiwayat.catatan && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catatan Peminjam</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedRiwayat.catatan}</p>
                  </div>
                )}

                {selectedRiwayat.catatan_admin && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catatan Admin</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedRiwayat.catatan_admin}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleContact(selectedRiwayat.telepon)}
                    disabled={!selectedRiwayat.telepon}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Hubungi via WhatsApp</span>
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

export default RiwayatPage;