import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  MessageCircle
} from 'lucide-react';

const AdminHomePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');
  const [searchTerm, setSearchTerm] = useState('');

  // Data konfirmasi terbaru
  const [konfirmasiTerbaru, setKonfirmasiTerbaru] = useState([
    {
      id: 1,
      nama: 'Ahmad Rizki',
      nim: '1234567890',
      barang: 'Tenda Dome 4 Person',
      tanggalPinjam: '15/12/2024',
      tanggalKembali: '22/12/2024',
      jumlah: 1,
      totalHarga: 175000,
      status: 'pending',
      waktuDiajukan: '2 jam yang lalu',
      instansi: 'Universitas Diponegoro'
    },
    {
      id: 2,
      nama: 'Sari Dewi',
      nim: '0987654321',
      barang: 'Kompor Portable Gas',
      tanggalPinjam: '16/12/2024',
      tanggalKembali: '19/12/2024',
      jumlah: 2,
      totalHarga: 90000,
      status: 'approved',
      waktuDiajukan: '5 jam yang lalu',
      instansi: 'Universitas Diponegoro'
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      nim: '1122334455',
      barang: 'Sleeping Bag -5°C',
      tanggalPinjam: '18/12/2024',
      tanggalKembali: '25/12/2024',
      jumlah: 1,
      totalHarga: 84000,
      status: 'rejected',
      waktuDiajukan: '1 hari yang lalu',
      instansi: 'Universitas Diponegoro'
    },
    {
      id: 4,
      nama: 'Maya Sari',
      nim: '5566778899',
      barang: 'Carrier 60L Expedition',
      tanggalPinjam: '20/12/2024',
      tanggalKembali: '27/12/2024',
      jumlah: 1,
      totalHarga: 140000,
      status: 'pending',
      waktuDiajukan: '3 jam yang lalu',
      instansi: 'Universitas Negeri Semarang'
    },
    {
      id: 5,
      nama: 'Rizki Pratama',
      nim: '6677889900',
      barang: 'Nesting Cooking Set',
      tanggalPinjam: '22/12/2024',
      tanggalKembali: '29/12/2024',
      jumlah: 1,
      totalHarga: 70000,
      status: 'approved',
      waktuDiajukan: '6 jam yang lalu',
      instansi: 'Universitas Diponegoro'
    }
  ]);

  // Data statistik peminjam per bulan
  const [statistikPeminjam, setStatistikPeminjam] = useState([
    { bulan: 'Jan', peminjam: 45, pendapatan: 4500000 },
    { bulan: 'Feb', peminjam: 52, pendapatan: 5200000 },
    { bulan: 'Mar', peminjam: 48, pendapatan: 4800000 },
    { bulan: 'Apr', peminjam: 61, pendapatan: 6100000 },
    { bulan: 'Mei', peminjam: 55, pendapatan: 5500000 },
    { bulan: 'Jun', peminjam: 68, pendapatan: 6800000 },
    { bulan: 'Jul', peminjam: 72, pendapatan: 7200000 },
    { bulan: 'Agu', peminjam: 65, pendapatan: 6500000 },
    { bulan: 'Sep', peminjam: 58, pendapatan: 5800000 },
    { bulan: 'Okt', peminjam: 63, pendapatan: 6300000 },
    { bulan: 'Nov', peminjam: 70, pendapatan: 7000000 },
    { bulan: 'Des', peminjam: 45, pendapatan: 4500000 }
  ]);

  // Data statistik overview
  const [statistikOverview, setStatistikOverview] = useState({
    totalPeminjaman: 243,
    pendingKonfirmasi: 8,
    sedangDipinjam: 15,
    totalPendapatan: 65800000
  });

  // Filter konfirmasi berdasarkan search term
  const filteredKonfirmasi = konfirmasiTerbaru.filter(konfirmasi =>
    konfirmasi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    konfirmasi.nim.includes(searchTerm) ||
    konfirmasi.barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const handleApprove = (id) => {
    setKonfirmasiTerbaru(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
  };

  const handleReject = (id) => {
    setKonfirmasiTerbaru(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'rejected' } : item
      )
    );
  };

  const handleContact = (nim) => {
    const phoneNumber = '6281234567890'; // Nomor admin
    const message = `Halo! Mengenai peminjaman barang Anda...`;
    const whatsappUrl = `https://wa.me/${nim}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola peminjaman barang dan pantau statistik</p>
        </div>

        {/* Statistik Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Peminjaman</p>
                <p className="text-3xl font-bold text-gray-900">{statistikOverview.totalPeminjaman}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% dari bulan lalu</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Konfirmasi</p>
                <p className="text-3xl font-bold text-gray-900">{statistikOverview.pendingKonfirmasi}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Menunggu persetujuan</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                <p className="text-3xl font-bold text-gray-900">{statistikOverview.sedangDipinjam}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Aktif sekarang</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatRupiah(statistikOverview.totalPendapatan).replace('Rp', 'Rp ')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% dari bulan lalu</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Konfirmasi Terbaru */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Konfirmasi Terbaru</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Peminjam</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Barang</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Periode</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredKonfirmasi.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.nama}</p>
                            <p className="text-sm text-gray-500">{item.nim}</p>
                            <p className="text-xs text-gray-400">{item.instansi}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-gray-900">{item.barang}</p>
                          <p className="text-sm text-gray-500">{item.jumlah} unit</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm text-gray-900">{item.tanggalPinjam} - {item.tanggalKembali}</p>
                          <p className="text-xs text-gray-500">{item.waktuDiajukan}</p>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span>{getStatusText(item.status)}</span>
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Setujui"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Tolak"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleContact(item.nim)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Hubungi"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredKonfirmasi.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada data konfirmasi</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-b-2xl">
              <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                Lihat Semua Konfirmasi →
              </button>
            </div>
          </div>

          {/* Right Column - Statistik Peminjam */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Statistik Peminjam per Bulan</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="bulan-ini">Bulan Ini</option>
                  <option value="3-bulan">3 Bulan</option>
                  <option value="6-bulan">6 Bulan</option>
                  <option value="tahun-ini">Tahun Ini</option>
                </select>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="space-y-6">
              {/* Bar Chart - Peminjam */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Jumlah Peminjam</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {statistikPeminjam.reduce((sum, item) => sum + item.peminjam, 0)}
                  </span>
                </div>
                <div className="flex items-end justify-between h-32">
                  {statistikPeminjam.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-6 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${(item.peminjam / 80) * 100}%` }}
                        title={`${item.peminjam} peminjam`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{item.bulan}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart - Pendapatan */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Pendapatan (juta)</h3>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {Math.round(statistikPeminjam.reduce((sum, item) => sum + item.pendapatan, 0) / 1000000)} JT
                  </span>
                </div>
                <div className="flex items-end justify-between h-32">
                  {statistikPeminjam.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-6 bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${(item.pendapatan / 8000000) * 100}%` }}
                        title={`Rp ${(item.pendapatan / 1000000).toFixed(1)} JT`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{item.bulan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Rata-rata Peminjam/Bulan</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(statistikPeminjam.reduce((sum, item) => sum + item.peminjam, 0) / statistikPeminjam.length)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Rata-rata Pendapatan/Bulan</p>
                <p className="text-2xl font-bold text-green-900">
                  Rp {Math.round(statistikPeminjam.reduce((sum, item) => sum + item.pendapatan, 0) / statistikPeminjam.length / 1000000)} JT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;