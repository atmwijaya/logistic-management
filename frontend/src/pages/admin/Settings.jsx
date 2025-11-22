import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [phoneNumber, setPhoneNumber] = useState("+62 812-3456-7890");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber);
  const navigate = useNavigate();

  const handleSavePhoneNumber = () => {
    setPhoneNumber(tempPhoneNumber);
    setIsEditingPhone(false);
    // Di sini Anda bisa menambahkan logika untuk menyimpan ke backend
  };

  const handleFAQEdit = () => {
    navigate("/admin/faqadminpage");
  };

  const handleCancelEdit = () => {
    setTempPhoneNumber(phoneNumber);
    setIsEditingPhone(false);
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

        {/* FAQ Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    value={tempPhoneNumber}
                    onChange={(e) => setTempPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSavePhoneNumber}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {phoneNumber}
                  </p>
                  <p className="text-sm text-gray-500">Nomor telepon aktif</p>
                </div>
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* About Application Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
                <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Kebijakan Privasi
                </button>
                <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Ketentuan Layanan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;