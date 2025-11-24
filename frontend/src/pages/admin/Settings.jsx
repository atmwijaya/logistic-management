import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import contactAPI from "../../api/contactAPI";

const Settings = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        setLoading(true);
        const result = await contactAPI.getContact();
        
        if (result.success) {
          // Format phone number
          let phone = result.phone || "";
          if (phone.startsWith("62")) {
            phone = phone.slice(2);
          }
          
          setPhoneNumber(result.phone || "");
          setTempPhoneNumber(phone);
          setEmail(result.email || "");
          setTempEmail(result.email || "");
        }
      } catch (err) {
        console.error("Error load contact info:", err);
        alert("Gagal memuat informasi kontak");
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  const handleSavePhoneNumber = async () => {
    const cleaned = tempPhoneNumber.trim();

    const check = contactAPI.utils.validatePhone(cleaned);
    if (!check.isValid) {
      alert(check.message);
      return;
    }

    const fullNumber = "62" + cleaned;

    try {
      setLoading(true);
      const result = await contactAPI.updateContact({
        phone_number: fullNumber,
        email: email
      });

      if (result.success) {
        setPhoneNumber(fullNumber);
        setIsEditingPhone(false);
        alert("Nomor telepon berhasil diupdate!");
      } else {
        alert(result.message || "Gagal mengupdate nomor telepon");
      }
    } catch (err) {
      alert("Gagal mengupdate nomor telepon");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    const cleanedEmail = tempEmail.trim();

    const check = contactAPI.utils.validateEmail(cleanedEmail);
    if (!check.isValid) {
      alert(check.message);
      return;
    }

    try {
      setLoading(true);
      const result = await contactAPI.updateContact({
        phone_number: phoneNumber,
        email: cleanedEmail
      });

      if (result.success) {
        setEmail(cleanedEmail);
        setIsEditingEmail(false);
        alert("Email berhasil diupdate!");
      } else {
        alert(result.message || "Gagal mengupdate email");
      }
    } catch (err) {
      alert("Gagal mengupdate email");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFAQEdit = () => {
    navigate("/admin/faqadminpage");
  };

  const handleCancelPhoneEdit = () => {
    const cleanPhone = phoneNumber.startsWith("62") ? phoneNumber.slice(2) : phoneNumber;
    setTempPhoneNumber(cleanPhone);
    setIsEditingPhone(false);
  };

  const handleCancelEmailEdit = () => {
    setTempEmail(email);
    setIsEditingEmail(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-2">
            Kelola pengaturan aplikasi dan konfigurasi sistem
          </p>
        </div>

        {loading && (
          <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700">Memproses...</p>
            </div>
          </div>
        )}

        {/* FAQ Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Manajemen FAQ
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Kelola Frequently Asked Questions (FAQ) aplikasi
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleFAQEdit}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Kelola FAQ
            </button>
          </div>
        </div>

        {/* Phone Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Konfigurasi Nomor Telepon
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Atur nomor telepon yang akan ditampilkan di aplikasi
              </p>
            </div>
          </div>

          <div className="mt-4">
            {isEditingPhone ? (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>

                <div className="flex items-center border rounded-md overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <span className="px-3 py-2 bg-gray-100 border-r text-gray-700">+62</span>
                  <input
                    type="text"
                    value={tempPhoneNumber}
                    onChange={(e) =>
                      setTempPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full px-3 py-2 focus:outline-none"
                    placeholder="8123456789"
                    maxLength={13}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSavePhoneNumber}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={handleCancelPhoneEdit}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {phoneNumber ? `+${phoneNumber}` : "Belum diatur"}
                  </p>
                  <p className="text-sm text-gray-500">Gunakan format +62</p>
                </div>
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Email Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Konfigurasi Email
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Atur alamat email yang akan ditampilkan di aplikasi
              </p>
            </div>
          </div>

          <div className="mt-4">
            {isEditingEmail ? (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>

                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="example@gmail.com"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEmail}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={handleCancelEmailEdit}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {email || "Belum diatur"}
                  </p>
                  <p className="text-sm text-gray-500">Alamat email kontak</p>
                </div>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* About Application Section */}
        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tentang Aplikasi
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Informasi mengenai aplikasi ini
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Deskripsi Aplikasi
              </h3>
              <p className="text-gray-600">
                Aplikasi ini merupakan platform manajemen yang membantu pengguna
                dalam mengelola berbagai aspek bisnis mereka dengan fitur-fitur
                yang lengkap dan mudah digunakan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Versi</h4>
                <p className="text-gray-600">v1.0.0</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Developer</h4>
                <p className="text-gray-600">Tim Pengembang</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Tanggal Rilis
                </h4>
                <p className="text-gray-600">1 Januari 2024</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Kontak Support
                </h4>
                <p className="text-gray-600">support@example.com</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Kebijakan Privasi & Ketentuan Layanan
              </h4>
              <div className="flex space-x-4">
                <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                  Kebijakan Privasi
                </button>
                <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                  Ketentuan Layanan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Settings;