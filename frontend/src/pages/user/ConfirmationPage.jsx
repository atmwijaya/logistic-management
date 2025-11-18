import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Package, MessageCircle, CheckCircle, Star, Home, Check, RefreshCw } from 'lucide-react';
import katalogAPI from '../../api/katalogAPI';

const ConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nim: '',
    jurusan: '',
    instansi: '',
    jumlahPinjam: 1,
    tanggalMulai: '',
    tanggalSelesai: '',
    catatan: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState('');
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data barang dari backend
  useEffect(() => {
    const loadBarangDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await katalogAPI.getById(id);
        console.log('📦 Barang detail response:', response); // Debug log
        
        // Handle berbagai kemungkinan struktur response
        const barang = response.data || response;
        
        if (!barang) {
          throw new Error('Data barang tidak ditemukan');
        }

        setSelectedBarang(barang);
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat data barang');
        console.error('Error loading barang detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBarangDetail();
    }
  }, [id]);

  // Format tanggal ke DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hitung total hari
  const calculateTotalHari = () => {
    if (formData.tanggalMulai && formData.tanggalSelesai) {
      const start = new Date(formData.tanggalMulai);
      const end = new Date(formData.tanggalSelesai);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  // Hitung total harga
  const calculateTotalHarga = () => {
    if (!selectedBarang) return 0;
    const totalHari = calculateTotalHari();
    return selectedBarang.harga * totalHari * formData.jumlahPinjam;
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedBarang) return;
    
    const totalHari = calculateTotalHari();
    const totalHarga = calculateTotalHarga();

    // Format tanggal untuk pesan WhatsApp
    const tanggalMulaiFormatted = formatDateToDDMMYYYY(formData.tanggalMulai);
    const tanggalSelesaiFormatted = formatDateToDDMMYYYY(formData.tanggalSelesai);

    // Format pesan untuk WhatsApp
    const message = `Halo Admin Racana Diponegoro!%0A%0A` +
      `Saya ingin meminjam barang dengan detail berikut:%0A%0A` +
      `📦 *Barang:* ${selectedBarang.nama}%0A` +
      `👤 *Nama Lengkap:* ${formData.namaLengkap}%0A` +
      `🎓 *NIM:* ${formData.nim}%0A` +
      `📚 *Jurusan:* ${formData.jurusan}%0A` +
      `🏫 *Instansi:* ${formData.instansi}%0A` +
      `📦 *Jumlah:* ${formData.jumlahPinjam} unit%0A` +
      `📅 *Tanggal Mulai:* ${tanggalMulaiFormatted}%0A` +
      `📅 *Tanggal Selesai:* ${tanggalSelesaiFormatted}%0A` +
      `⏱️ *Lama Pinjam:* ${totalHari} hari%0A` +
      `💰 *Total Biaya:* Rp ${totalHarga.toLocaleString('id-ID')}%0A` +
      `📝 *Catatan:* ${formData.catatan || 'Tidak ada catatan'}%0A%0A` +
      `Apakah barang tersedia untuk periode tersebut?%0A` +
      `Terima kasih!`;

    // Buka WhatsApp
    const phoneNumber = '6281215452982'; // Ganti dengan nomor admin
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Set waktu submit dan status
    setSubmissionTime(new Date().toLocaleString('id-ID'));
    setIsSubmitted(true);
    
    window.open(whatsappUrl, '_blank');
  };

  // Set tanggal minimum (hari ini)
  const today = new Date().toISOString().split('T')[0];

  // Get image URL - sesuaikan dengan struktur data
  const getImageUrl = () => {
    if (!selectedBarang || !selectedBarang.gambar) {
      return '/placeholder-image.jpg';
    }

    // Handle berbagai kemungkinan struktur gambar
    if (Array.isArray(selectedBarang.gambar) && selectedBarang.gambar.length > 0) {
      const firstImage = selectedBarang.gambar[0];
      
      // Jika gambar adalah object dengan property url
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
      // Jika gambar adalah string URL langsung
      else if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    // Jika gambar adalah string tunggal
    else if (typeof selectedBarang.gambar === 'string') {
      return selectedBarang.gambar;
    }

    return '/placeholder-image.jpg';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data barang...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !selectedBarang) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
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

  // Tampilan setelah submit
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Permintaan Berhasil Dikirim!
            </h1>
            
            <p className="text-lg text-slate-600 mb-6">
              Permintaan peminjaman Anda telah dikonfirmasi. Silakan menunggu jawaban dari admin via WhatsApp.
            </p>

            <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium">Barang:</span>
                  <span>{selectedBarang.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Nama:</span>
                  <span>{formData.namaLengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Waktu Konfirmasi:</span>
                  <span>{submissionTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/katalog')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Home className="w-6 h-6" />
                <span>Kembali ke Katalog</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white border border-slate-300 text-slate-700 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Kembali ke Beranda
              </button>
            </div>

            {/* Information Box */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Info Penting</span>
              </h4>
              <p className="text-sm text-slate-600">
                Admin akan menghubungi Anda dalam 1x24 jam via WhatsApp. Pastikan WhatsApp Anda aktif.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Product Detail Section - ATAS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Image */}
            <div className="lg:w-1/3">
              <img
                src={getImageUrl()}
                alt={selectedBarang.nama}
                className="w-full h-64 object-cover rounded-xl"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {selectedBarang.kategori?.toUpperCase() || 'OUTDOOR'}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {selectedBarang.nama}
                  </h1>
                </div>
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                {selectedBarang.deskripsi}
              </p>

              {/* Product Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    Rp {selectedBarang.harga?.toLocaleString('id-ID') || '0'}
                  </div>
                  <div className="text-sm text-slate-500">per hari</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {selectedBarang.stok || 0}
                  </div>
                  <div className="text-sm text-slate-500">stok tersedia</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600 mb-1">
                    {selectedBarang.maks_peminjaman || selectedBarang.maksPeminjaman || '-'}
                  </div>
                  <div className="text-sm text-slate-500">maksimal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {selectedBarang.lokasi || 'Gudang Utama'}
                  </div>
                  <div className="text-sm text-slate-500">lokasi</div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Ringkasan Peminjaman</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harga per hari</span>
                    <span className="text-slate-800">
                      Rp {selectedBarang.harga?.toLocaleString('id-ID') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Jumlah unit</span>
                    <span className="text-slate-800">{formData.jumlahPinjam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lama pinjam</span>
                    <span className="text-slate-800">{calculateTotalHari()} hari</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                    <span>Total Biaya</span>
                    <span className="text-blue-600">
                      Rp {calculateTotalHarga().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - BAWAH */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Form Peminjaman Barang</h2>
              <p className="text-slate-600">Isi data diri dan detail peminjaman dengan benar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Diri Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Diri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NIM *
                  </label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 1234567890"
                  />
                  <p className="text-xs text-slate-500 mt-2">Masukkan NIM tanpa huruf</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jurusan *
                  </label>
                  <input
                    type="text"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Teknik Informatika"
                  />
                  <p className="text-xs text-slate-500 mt-2">Tulis nama jurusan lengkap</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Instansi *
                  </label>
                  <input
                    type="text"
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Universitas Diponegoro"
                  />
                  <p className="text-xs text-slate-500 mt-2">Tulis nama instansi/kampus</p>
                </div>
              </div>
            </div>

            {/* Detail Peminjaman Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Detail Peminjaman</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jumlah Unit *
                  </label>
                  <select
                    name="jumlahPinjam"
                    value={formData.jumlahPinjam}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[...Array(Math.min(selectedBarang.stok || 1, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} unit
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleChange}
                    required
                    min={today}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleChange}
                    required
                    min={formData.tanggalMulai || today}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan khusus untuk admin..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={!formData.namaLengkap || !formData.nim || !formData.jurusan || !formData.instansi || !formData.tanggalMulai || !formData.tanggalSelesai}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Konfirmasi via WhatsApp</span>
                <CheckCircle className="w-6 h-6" />
              </button>
              <p className="text-center text-slate-500 text-sm mt-3">
                Data akan dikirim ke admin via WhatsApp untuk konfirmasi
              </p>
            </div>
          </form>
        </div>

        {/* Information Box */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Informasi Penting</span>
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Pastikan data diri yang diisi sudah benar</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Admin akan menghubungi Anda via WhatsApp untuk konfirmasi</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Pengambilan barang di {selectedBarang.lokasi || 'Gudang Utama'}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Bawa KTM saat pengambilan barang</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;