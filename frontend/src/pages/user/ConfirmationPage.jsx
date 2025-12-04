import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Package,
  MessageCircle,
  CheckCircle,
  Star,
  Home,
  Check,
  RefreshCw,
  Phone,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import katalogAPI from "../../api/katalogAPI";
import peminjamanAPI from "../../api/peminjamanAPI";
import contactAPI from "../../api/contactAPI";

const ConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nim: "",
    jurusan: "",
    instansi: "",
    telepon: "", // Hanya bagian setelah +62
    jumlahPinjam: 1,
    tanggalMulai: "",
    tanggalSelesai: "",
    catatan: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState("");
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBarangDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await katalogAPI.getById(id);
        console.log("📦 Barang detail response:", response);
        const barang = response.data || response;

        if (!barang) {
          throw new Error("Data barang tidak ditemukan");
        }

        setSelectedBarang(barang);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat memuat data barang");
        console.error("Error loading barang detail:", err);
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
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Hitung total hari dengan error handling
  const calculateTotalHari = () => {
    try {
      if (formData.tanggalMulai && formData.tanggalSelesai) {
        const start = new Date(formData.tanggalMulai);
        const end = new Date(formData.tanggalSelesai);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 1;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
      }
      return 1;
    } catch (error) {
      console.error("Error calculating total days:", error);
      return 1;
    }
  };

  // Hitung total harga dengan error handling
  const calculateTotalHarga = () => {
    try {
      if (!selectedBarang || !selectedBarang.harga) return 0;
      const totalHari = calculateTotalHari();
      const harga = Number(selectedBarang.harga) || 0;
      const jumlah = Number(formData.jumlahPinjam) || 1;
      return harga * totalHari * jumlah;
    } catch (error) {
      console.error("Error calculating total price:", error);
      return 0;
    }
  };

  // Validasi nomor telepon (hanya bagian setelah +62)
  const validatePhoneNumber = (phone) => {
    if (!phone) {
      return "Nomor telepon wajib diisi";
    }

    // Hanya angka yang diperbolehkan
    if (!/^\d+$/.test(phone)) {
      return "Hanya angka yang diperbolehkan";
    }

    // Panjang minimal 9 digit, maksimal 15 digit (setelah +62)
    if (phone.length < 9) {
      return "Nomor telepon terlalu pendek. Minimal 9 angka setelah +62";
    }

    if (phone.length > 15) {
      return "Nomor telepon terlalu panjang. Maksimal 15 angka setelah +62";
    }

    // Validasi format Indonesia (harus dimulai dengan 8)
    if (!phone.startsWith("8")) {
      return "Nomor Indonesia harus dimulai dengan angka 8";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle change untuk telepon (hanya menerima angka)
  const handlePhoneChange = (e) => {
    const value = e.target.value;

    // Hanya menerima angka
    const numericValue = value.replace(/[^\d]/g, "");

    setFormData((prev) => ({
      ...prev,
      telepon: numericValue,
    }));

    // Validasi real-time
    const validationError = validatePhoneNumber(numericValue);
    setPhoneError(validationError);
  };

  // Format telepon lengkap (gabungan +62 dengan input user)
  const getFullPhoneNumber = () => {
    return `+62${formData.telepon}`;
  };

  // Generate options untuk jumlah pinjam dengan safe array length
  const generateJumlahOptions = () => {
    try {
      if (!selectedBarang) return [];

      const stok = Number(selectedBarang.stok) || 0;
      const maksPeminjaman = Number(selectedBarang.maks_peminjaman) || 10;

      if (stok <= 0) return [];

      // Gunakan batas yang aman
      const maxItems = Math.min(stok, maksPeminjaman, 20); // Batasi maksimal 20
      const options = [];

      for (let i = 1; i <= maxItems; i++) {
        options.push(
          <option key={i} value={i}>
            {i} unit
          </option>
        );
      }

      return options;
    } catch (error) {
      console.error("Error generating jumlah options:", error);
      return [
        <option key={1} value={1}>
          1 unit
        </option>,
      ];
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBarang) {
      setError("Data barang tidak tersedia");
      return;
    }

    // Validasi final sebelum submit
    const phoneValidationError = validatePhoneNumber(formData.telepon);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    const totalHari = calculateTotalHari();
    const totalHarga = calculateTotalHarga();

    const stok = Number(selectedBarang.stok) || 0;
    const jumlahPinjam = Number(formData.jumlahPinjam) || 1;

    if (jumlahPinjam > stok) {
      setError(`Jumlah peminjaman melebihi stok tersedia. Stok: ${stok}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const peminjamanData = {
        nama_lengkap: formData.namaLengkap.trim(),
        nim: formData.nim.trim(),
        jurusan: formData.jurusan.trim(),
        instansi: formData.instansi.trim(),
        barang_id: id,
        jumlah_pinjam: jumlahPinjam,
        tanggal_mulai: formData.tanggalMulai,
        tanggal_selesai: formData.tanggalSelesai,
        lama_pinjam: totalHari,
        total_biaya: totalHarga,
        catatan: formData.catatan.trim() || "",
        telepon: getFullPhoneNumber(),
        email: "",
      };

      console.log("📤 Mengirim data peminjaman:", peminjamanData);

      // Kirim data ke backend menggunakan peminjamanAPI
      const result = await peminjamanAPI.create(peminjamanData);

      if (result.success) {
        console.log("✅ Data peminjaman berhasil disimpan:", result.data);

        // Lanjutkan dengan proses WhatsApp
        const tanggalMulaiFormatted = formatDateToDDMMYYYY(
          formData.tanggalMulai
        );
        const tanggalSelesaiFormatted = formatDateToDDMMYYYY(
          formData.tanggalSelesai
        );

        const message =
          `Halo Admin Racana Diponegoro!%0A%0A` +
          `Saya ingin meminjam barang dengan detail berikut:%0A%0A` +
          `📦 *Barang:* ${selectedBarang.nama}%0A` +
          `👤 *Nama Lengkap:* ${formData.namaLengkap}%0A` +
          `🎓 *NIM:* ${formData.nim}%0A` +
          `📚 *Jurusan:* ${formData.jurusan}%0A` +
          `🏫 *Instansi:* ${formData.instansi}%0A` +
          `📱 *Telepon:* ${getFullPhoneNumber()}%0A` +
          `📦 *Jumlah:* ${formData.jumlahPinjam} unit%0A` +
          `📅 *Tanggal Mulai:* ${tanggalMulaiFormatted}%0A` +
          `📅 *Tanggal Selesai:* ${tanggalSelesaiFormatted}%0A` +
          `⏱️ *Lama Pinjam:* ${totalHari} hari%0A` +
          `💰 *Total Biaya:* Rp ${totalHarga.toLocaleString("id-ID")}%0A` +
          `📝 *Catatan:* ${formData.catatan || "Tidak ada catatan"}%0A%0A` +
          `Apakah barang tersedia untuk periode tersebut?%0A` +
          `Terima kasih!`;

        const response = await contactAPI.getContact();
        const phoneNumber = response.phone || "";

        setSubmissionTime(new Date().toLocaleString("id-ID"));
        setIsSubmitted(true);

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        setSubmissionTime(new Date().toLocaleString("id-ID"));
        setIsSubmitted(true);

        window.open(whatsappUrl, "_blank");
      } else {
        throw new Error(result.message || "Gagal menyimpan data peminjaman");
      }
    } catch (error) {
      console.error("❌ Error mengirim data peminjaman:", error);
      setError(
        error.message ||
          "Terjadi kesalahan saat mengirim data peminjaman. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const getImageUrl = () => {
    try {
      if (!selectedBarang || !selectedBarang.gambar) {
        return "/placeholder-image.jpg";
      }
      if (
        Array.isArray(selectedBarang.gambar) &&
        selectedBarang.gambar.length > 0
      ) {
        const firstImage = selectedBarang.gambar[0];
        if (typeof firstImage === "object" && firstImage.url) {
          return firstImage.url;
        }
        else if (typeof firstImage === "string") {
          return firstImage;
        }
      }
      else if (typeof selectedBarang.gambar === "string") {
        return selectedBarang.gambar;
      }

      return "/placeholder-image.jpg";
    } catch (error) {
      console.error("Error getting image URL:", error);
      return "/placeholder-image.jpg";
    }
  };

  const isFormValid = () => {
    return (
      formData.namaLengkap &&
      formData.nim &&
      formData.jurusan &&
      formData.instansi &&
      formData.telepon &&
      formData.tanggalMulai &&
      formData.tanggalSelesai &&
      !phoneError
    );
  };

  const formatRupiah = (number) => {
    try {
      return new Intl.NumberFormat("id-ID").format(Number(number) || 0);
    } catch (error) {
      console.error("Error formatting Rupiah:", error);
      return "0";
    }
  };

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

  if (error && !selectedBarang) {
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Barang Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/katalog")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Permintaan peminjaman Anda telah dikonfirmasi. Silakan menunggu
              jawaban dari admin via WhatsApp.
            </p>

            <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium">Barang:</span>
                  <span>{selectedBarang?.nama || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Nama:</span>
                  <span>{formData.namaLengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Telepon:</span>
                  <span>{getFullPhoneNumber()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Waktu Konfirmasi:</span>
                  <span>{submissionTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/katalog")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Home className="w-6 h-6" />
                <span>Kembali ke Katalog</span>
              </button>

              <button
                onClick={() => navigate("/")}
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
                Admin akan menghubungi Anda dalam 1x24 jam via WhatsApp.
                Pastikan WhatsApp Anda aktif dan nomor {getFullPhoneNumber()}{" "}
                benar.
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Terjadi Kesalahan</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <span className="sr-only">Tutup</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}

        {/* Product Detail Section - ATAS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Image */}
            <div className="lg:w-1/3">
              <div className="relative">
                <img
                  src={getImageUrl()}
                  alt={selectedBarang?.nama || "Barang"}
                  className="w-full h-64 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
                {selectedBarang?.stok === 0 && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-80 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      STOK HABIS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {selectedBarang?.kategori?.toUpperCase() || "OUTDOOR"}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {selectedBarang?.nama || "Nama Barang"}
                  </h1>
                </div>
                {selectedBarang?.stok > 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Tersedia</span>
                  </div>
                )}
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                {selectedBarang?.deskripsi ||
                  "Deskripsi barang tidak tersedia."}
              </p>

              {/* Product Stats - Compact Tag Version */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-bold text-blue-600">
                    Rp {formatRupiah(selectedBarang?.harga)}
                  </span>
                  <span className="text-xs text-blue-500">/hari</span>
                </div>

                <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-bold text-green-600">
                    {selectedBarang?.stok || 0}
                  </span>
                  <span className="text-xs text-green-500">stok</span>
                </div>

                <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  <Users className="w-3 h-3 text-orange-600" />
                  <span className="text-xs font-bold text-orange-600">
                    {selectedBarang?.maks_peminjaman ||
                      selectedBarang?.maksPeminjaman ||
                      "-"}
                  </span>
                  <span className="text-xs text-orange-500">maks</span>
                </div>

                <div className="flex items-center space-x-1 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-bold text-purple-600 truncate max-w-[100px]">
                    {selectedBarang?.lokasi || "Gudang Utama"}
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Ringkasan Peminjaman</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harga per hari</span>
                    <span className="text-slate-800 font-medium">
                      Rp {formatRupiah(selectedBarang?.harga)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Jumlah unit</span>
                    <span className="text-slate-800 font-medium">
                      {formData.jumlahPinjam}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lama pinjam</span>
                    <span className="text-slate-800 font-medium">
                      {calculateTotalHari()} hari
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                    <span>Total Biaya</span>
                    <span className="text-blue-600">
                      Rp {formatRupiah(calculateTotalHarga())}
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
              <h2 className="text-2xl font-bold text-slate-800">
                Form Peminjaman Barang
              </h2>
              <p className="text-slate-600">
                Isi data diri dan detail peminjaman dengan benar
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Diri Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Data Diri
              </h3>
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: 1234567890"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Masukkan NIM tanpa huruf
                  </p>
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: Teknik Informatika"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Tulis nama jurusan lengkap
                  </p>
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: Universitas Diponegoro"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Tulis nama instansi/kampus
                  </p>
                </div>

                {/* Field Telepon - DIPISAH +62 dan input angka */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nomor Telepon (WhatsApp) *
                  </label>
                  <div className="flex space-x-3">
                    {/* Bagian +62 (fixed) */}
                    <div className="flex-1 max-w-24">
                      <label className="block text-xs text-slate-500 mb-1">
                        Kode Negara
                      </label>
                      <div className="relative">
                        <div className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-xl text-slate-600 font-medium flex items-center justify-center">
                          +62
                        </div>
                      </div>
                    </div>

                    {/* Bagian input angka */}
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="telepon"
                          value={formData.telepon}
                          onChange={handlePhoneChange}
                          required
                          maxLength={15}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                            phoneError
                              ? "border-red-300 bg-red-50"
                              : "border-slate-300"
                          }`}
                          placeholder="8123456789"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview nomor lengkap */}
                  {formData.telepon && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <span className="font-medium">Nomor lengkap:</span> +62
                        {formData.telepon}
                      </p>
                    </div>
                  )}

                  {phoneError ? (
                    <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs mt-2">
                      Masukkan nomor telepon tanpa +62. Contoh: 8123456789
                      <br />
                      <span className="text-orange-600">
                        Panjang: {formData.telepon.length}/15 digit • Harus
                        dimulai dengan angka 8
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Peminjaman Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Detail Peminjaman
              </h3>
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
                    disabled={!selectedBarang || selectedBarang.stok === 0}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    {!selectedBarang || selectedBarang.stok === 0 ? (
                      <option value="0">Stok Habis</option>
                    ) : (
                      generateJumlahOptions()
                    )}
                  </select>
                  {selectedBarang?.stok > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Maksimal:{" "}
                      {Math.min(
                        selectedBarang.stok,
                        selectedBarang?.maks_peminjaman || 10
                      )}{" "}
                      unit
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      name="tanggalMulai"
                      value={formData.tanggalMulai}
                      onChange={handleChange}
                      required
                      min={today}
                      disabled={!selectedBarang || selectedBarang.stok === 0}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Selesai *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      name="tanggalSelesai"
                      value={formData.tanggalSelesai}
                      onChange={handleChange}
                      required
                      min={formData.tanggalMulai || today}
                      disabled={
                        !selectedBarang ||
                        selectedBarang.stok === 0 ||
                        !formData.tanggalMulai
                      }
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Periode Info */}
              {formData.tanggalMulai && formData.tanggalSelesai && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Lama peminjaman:{" "}
                      <strong>{calculateTotalHari()} hari</strong> • Total
                      biaya:{" "}
                      <strong>Rp {formatRupiah(calculateTotalHarga())}</strong>
                    </span>
                  </p>
                </div>
              )}

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
                  disabled={!selectedBarang || selectedBarang.stok === 0}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="Tambahkan catatan khusus untuk admin (contoh: untuk acara camping, penelitian, dll)..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200">
              {!selectedBarang || selectedBarang.stok === 0 ? (
                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-red-700 mb-2">
                    Stok Habis
                  </h4>
                  <p className="text-red-600 mb-4">
                    Maaf, barang ini sedang tidak tersedia untuk dipinjam.
                  </p>
                  <button
                    onClick={() => navigate("/katalog")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Cari Barang Lain
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={!isFormValid() || submitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 relative"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-6 h-6" />
                        <span>Konfirmasi via WhatsApp</span>
                        <CheckCircle className="w-6 h-6" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-slate-500 text-sm mt-3">
                    Data akan dikirim ke database dan admin via WhatsApp untuk
                    konfirmasi
                  </p>
                </>
              )}
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
              <span>Pastikan data diri yang diisi sudah benar dan valid</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>
                Gunakan nomor WhatsApp aktif untuk konfirmasi dari admin
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>
                Admin akan menghubungi Anda via WhatsApp dalam 1x24 jam
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>
                Pengambilan barang di{" "}
                <strong>{selectedBarang?.lokasi || "Gudang Utama"}</strong>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Bawa KTM asli saat pengambilan barang</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>
                Pastikan barang dikembalikan dalam kondisi baik dan tepat waktu
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
