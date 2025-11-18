import React, { useState } from 'react';
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
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download
} from 'lucide-react';

const DaftarPeminjam = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPeminjam, setSelectedPeminjam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data peminjam yang sudah konfirmasi via WhatsApp
  const [daftarPeminjam, setDaftarPeminjam] = useState([
    {
      id: 1,
      nama: 'Ahmad Rizki',
      nim: '1234567890',
      telepon: '+628123456789',
      email: 'ahmad.rizki@student.undip.ac.id',
      jurusan: 'Teknik Informatika',
      instansi: 'Universitas Diponegoro',
      barang: {
        id: 1,
        nama: 'Tenda Dome 4 Person',
        gambar: 'https://images.unsplash.com/photo-1571687949921-1306bfb24c72?w=100&h=75&fit=crop&crop=center',
        harga: 25000
      },
      jumlah: 1,
      tanggalMulai: '15/12/2024',
      tanggalSelesai: '22/12/2024',
      lamaPinjam: 7,
      totalBiaya: 175000,
      catatan: 'Untuk acara camping organisasi',
      status: 'pending',
      waktuKonfirmasi: '2024-12-14 10:30:00',
      metodeKonfirmasi: 'whatsapp'
    },
    {
      id: 2,
      nama: 'Sari Dewi',
      nim: '0987654321',
      telepon: '+628987654321',
      email: 'sari.dewi@student.undip.ac.id',
      jurusan: 'Manajemen',
      instansi: 'Universitas Diponegoro',
      barang: {
        id: 2,
        nama: 'Kompor Portable Gas',
        gambar: 'https://images.unsplash.com/photo-1606811841685-b30c2255c99a?w=100&h=75&fit=crop&crop=center',
        harga: 15000
      },
      jumlah: 2,
      tanggalMulai: '16/12/2024',
      tanggalSelesai: '19/12/2024',
      lamaPinjam: 3,
      totalBiaya: 90000,
      catatan: 'Untuk kegiatan outdoor kampus',
      status: 'approved',
      waktuKonfirmasi: '2024-12-14 09:15:00',
      metodeKonfirmasi: 'whatsapp'
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      nim: '1122334455',
      telepon: '+6281122334455',
      email: 'budi.santoso@student.undip.ac.id',
      jurusan: 'Teknik Sipil',
      instansi: 'Universitas Diponegoro',
      barang: {
        id: 3,
        nama: 'Sleeping Bag -5°C',
        gambar: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=75&fit=crop&crop=center',
        harga: 12000
      },
      jumlah: 1,
      tanggalMulai: '18/12/2024',
      tanggalSelesai: '25/12/2024',
      lamaPinjam: 7,
      totalBiaya: 84000,
      catatan: 'Untuk pendakian gunung',
      status: 'rejected',
      waktuKonfirmasi: '2024-12-13 14:20:00',
      metodeKonfirmasi: 'whatsapp'
    },
    {
      id: 4,
      nama: 'Maya Sari',
      nim: '5566778899',
      telepon: '+6285566778899',
      email: 'maya.sari@student.unnes.ac.id',
      jurusan: 'Pendidikan Olahraga',
      instansi: 'Universitas Negeri Semarang',
      barang: {
        id: 4,
        nama: 'Carrier 60L Expedition',
        gambar: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=75&fit=crop&crop=center',
        harga: 20000
      },
      jumlah: 1,
      tanggalMulai: '20/12/2024',
      tanggalSelesai: '27/12/2024',
      lamaPinjam: 7,
      totalBiaya: 140000,
      catatan: 'Untuk penelitian lapangan',
      status: 'pending',
      waktuKonfirmasi: '2024-12-14 11:45:00',
      metodeKonfirmasi: 'whatsapp'
    },
    {
      id: 5,
      nama: 'Rizki Pratama',
      nim: '6677889900',
      telepon: '+6286677889900',
      email: 'rizki.pratama@student.undip.ac.id',
      jurusan: 'Teknik Elektro',
      instansi: 'Universitas Diponegoro',
      barang: {
        id: 5,
        nama: 'Nesting Cooking Set',
        gambar: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=75&fit=crop&crop=center',
        harga: 10000
      },
      jumlah: 1,
      tanggalMulai: '22/12/2024',
      tanggalSelesai: '29/12/2024',
      lamaPinjam: 7,
      totalBiaya: 70000,
      catatan: 'Untuk camping keluarga',
      status: 'approved',
      waktuKonfirmasi: '2024-12-14 08:30:00',
      metodeKonfirmasi: 'whatsapp'
    },
    {
      id: 6,
      nama: 'Dewi Anggraini',
      nim: '2233445566',
      telepon: '+6282233445566',
      email: 'dewi.anggraini@student.undip.ac.id',
      jurusan: 'Psikologi',
      instansi: 'Universitas Diponegoro',
      barang: {
        id: 6,
        nama: 'Headlamp LED Waterproof',
        gambar: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=75&fit=crop&crop=center',
        harga: 8000
      },
      jumlah: 2,
      tanggalMulai: '23/12/2024',
      tanggalSelesai: '26/12/2024',
      lamaPinjam: 3,
      totalBiaya: 48000,
      catatan: 'Untuk kegiatan malam di alam terbuka',
      status: 'pending',
      waktuKonfirmasi: '2024-12-14 13:15:00',
      metodeKonfirmasi: 'whatsapp'
    }
  ]);

  // Filter data berdasarkan search term dan status
  const filteredPeminjam = daftarPeminjam.filter(peminjam =>
    (peminjam.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
     peminjam.nim.includes(searchTerm) ||
     peminjam.barang.nama.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'semua' || peminjam.status === statusFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredPeminjam.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeminjam.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      case 'pending': return 'Menunggu';
      default: return 'Tidak Diketahui';
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatWaktu = (waktu) => {
    return new Date(waktu).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = (id) => {
    setDaftarPeminjam(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
  };

  const handleReject = (id) => {
    setDaftarPeminjam(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'rejected' } : item
      )
    );
  };

  const handleInspect = (peminjam) => {
    setSelectedPeminjam(peminjam);
    setShowDetailModal(true);
  };

  const handleContact = (telepon) => {
    const message = 'Halo! Mengenai peminjaman barang Anda...';
    const whatsappUrl = `https://wa.me/${telepon.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Peminjam</h1>
          <p className="text-gray-600">Kelola konfirmasi peminjaman barang dari WhatsApp</p>
        </div>

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="10">10 per halaman</option>
                <option value="30">30 per halaman</option>
                <option value="50">50 per halaman</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">
              Menampilkan {filteredPeminjam.length} peminjam
            </span>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300">
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Peminjam & Barang</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Periode</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Biaya</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Waktu Konfirmasi</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((peminjam) => (
                  <tr key={peminjam.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={peminjam.barang.gambar}
                          alt={peminjam.barang.nama}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-gray-900">{peminjam.nama}</p>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">NIM: {peminjam.nim}</p>
                          <p className="text-sm font-medium text-gray-900">{peminjam.barang.nama}</p>
                          <p className="text-xs text-gray-500">{peminjam.jumlah} unit • {peminjam.instansi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{peminjam.tanggalMulai} - {peminjam.tanggalSelesai}</span>
                      </div>
                      <p className="text-xs text-gray-500">{peminjam.lamaPinjam} hari</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{formatRupiah(peminjam.totalBiaya)}</p>
                      <p className="text-xs text-gray-500">{formatRupiah(peminjam.barang.harga)}/hari</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(peminjam.status)}`}>
                        {getStatusText(peminjam.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{formatWaktu(peminjam.waktuKonfirmasi)}</p>
                      <p className="text-xs text-gray-500 capitalize">{peminjam.metodeKonfirmasi}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleInspect(peminjam)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleContact(peminjam.telepon)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                          title="Hubungi"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        {peminjam.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(peminjam.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(peminjam.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data peminjam</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPeminjam.length)} dari {filteredPeminjam.length}
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
                          ? 'bg-blue-600 text-white'
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
      {showDetailModal && selectedPeminjam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detail Peminjaman</h3>
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
                  <h4 className="font-semibold text-gray-900 mb-4">Informasi Peminjam</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama Lengkap</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">NIM</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.nim}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jurusan</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.jurusan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instansi</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.instansi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telepon</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.telepon}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.email}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Barang */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Informasi Barang</h4>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={selectedPeminjam.barang.gambar}
                      alt={selectedPeminjam.barang.nama}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedPeminjam.barang.nama}</p>
                      <p className="text-sm text-gray-600">Jumlah: {selectedPeminjam.jumlah} unit</p>
                      <p className="text-sm text-gray-600">Harga: {formatRupiah(selectedPeminjam.barang.harga)}/hari</p>
                    </div>
                  </div>
                </div>

                {/* Detail Peminjaman */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Detail Peminjaman</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Mulai</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.tanggalMulai}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Selesai</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.tanggalSelesai}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lama Pinjam</p>
                      <p className="font-medium text-gray-900">{selectedPeminjam.lamaPinjam} hari</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Biaya</p>
                      <p className="font-medium text-gray-900">{formatRupiah(selectedPeminjam.totalBiaya)}</p>
                    </div>
                  </div>
                </div>

                {/* Catatan */}
                {selectedPeminjam.catatan && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catatan</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedPeminjam.catatan}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleContact(selectedPeminjam.telepon)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Hubungi via WhatsApp</span>
                  </button>
                  {selectedPeminjam.status === 'pending' && (
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