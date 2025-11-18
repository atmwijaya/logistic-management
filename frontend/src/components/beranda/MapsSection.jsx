import React, { useState } from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';

const MapsSection = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const locationInfo = {
    name: "Gudang Logistik Racana Diponegoro",
    address: "Jl. Prof. DR. Soedharto, SH, Tembalang, Semarang, Jawa Tengah 50275",
    coordinates: {
      lat: -7.050747,
      lng: 110.433243
    },
    googleMapsUrl: "https://maps.google.com/?q=-7.050747,110.433243",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.207835742022!2d110.430668!3d-7.050747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708c5bd8ed32a5%3A0x5cd793dddc1d59ca!2sUniversitas%20Diponegoro!5e0!3m2!1sen!2sid!4v1640000000000!5m2!1sen!2sid",
    operatingHours: {
      weekdays: "08:00 - 16:00 WIB",
      weekends: "08:00 - 14:00 WIB"
    },
    contact: {
      phone: "+62 812-3456-7890",
      email: "logistik@racanadiponegoro.ac.id"
    }
  };

  const handleMapLoad = () => {
    setIsMapLoaded(true);
  };

  const handleOpenInMaps = () => {
    window.open(locationInfo.googleMapsUrl, '_blank');
  };

  const handleGetDirections = () => {
    const { lat, lng } = locationInfo.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Lokasi Pengambilan Barang
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan lokasi gudang logistik kami untuk pengambilan dan pengembalian barang
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Map */}
          <div className="relative">
            {/* Map Container */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              {/* Loading State */}
              {!isMapLoaded && (
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Memuat peta...</p>
                  </div>
                </div>
              )}

              {/* Google Maps Embed */}
              <div className="relative aspect-video">
                <iframe
                  src={locationInfo.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={handleMapLoad}
                  className="transition-opacity duration-300"
                ></iframe>
              </div>

              {/* Map Overlay Actions */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={handleOpenInMaps}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Buka di Maps</span>
                </button>
                <button
                  onClick={handleGetDirections}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm font-medium">Petunjuk</span>
                </button>
              </div>
            </div>

            {/* Map Attribution */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500">
                Sumber: Google Maps • Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {/* Right Column - Location Details */}
          <div className="space-y-6">
            {/* Location Name */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {locationInfo.name}
              </h3>
              <div className="flex items-start space-x-3 text-slate-600">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{locationInfo.address}</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Jam Operasional</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Senin - Jumat</span>
                  <span className="font-semibold text-slate-800">{locationInfo.operatingHours.weekdays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Sabtu - Minggu</span>
                  <span className="font-semibold text-slate-800">{locationInfo.operatingHours.weekends}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 text-center">
                  📍 Pastikan datang dalam jam operasional untuk pengambilan barang
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Kontak & Informasi</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500">Telepon/WhatsApp</p>
                    <p className="font-semibold text-slate-800">{locationInfo.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-800">{locationInfo.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <h4 className="text-lg font-semibold text-slate-800 mb-3">Yang Perlu Diperhatikan</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Bawa KTM atau identitas lainnya saat pengambilan barang</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Konfirmasi terlebih dahulu via WhatsApp sebelum datang</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Parkir kendaraan tersedia di area kampus</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Barang harus diambil maksimal 2 hari setelah persetujuan</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGetDirections}
                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Navigation className="w-5 h-5" />
                <span>Dapatkan Petunjuk Arah</span>
              </button>
              <button className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Hubungi Kami</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapsSection;