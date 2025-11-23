import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  Send,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import phoneAPI from "../../api/phoneNumberAPI";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Cek Nama", href: "/daftar-anggota" },
    { name: "FAQ", href: "/faq" },
  ];

  const services = [
    { name: "Pinjam Barang", href: "/pinjam" },
    { name: "Katalog Barang", href: "/katalog" },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: "Jl. Prof. DR. Soedharto, SH, Tembalang, Semarang, Jawa Tengah 50275",
      href: "#",
    },
    {
      icon: Phone,
      text: "+62 812-3456-7890",
      href: "tel:+6281234567890",
    },
    {
      icon: Mail,
      text: "logistik@racanadiponegoro.ac.id",
      href: "mailto:logistik@racanadiponegoro.ac.id",
    },
    {
      icon: Clock,
      text: "Senin - Jumat: 08:00 - 16:00 WIB",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: "Facebook",
      href: "https://facebook.com/racanadiponegoro",
      color: "hover:bg-blue-600",
    },
    {
      icon: Instagram,
      name: "Instagram",
      href: "https://instagram.com/racanadiponegoro",
      color: "hover:bg-pink-600",
    },
    {
      icon: Twitter,
      name: "Twitter",
      href: "https://twitter.com/racanadiponegoro",
      color: "hover:bg-blue-400",
    },
    {
      icon: Youtube,
      name: "YouTube",
      href: "https://youtube.com/racanadiponegoro",
      color: "hover:bg-red-600",
    },
  ];

  const handleWhatsAppClick = async () => {
    try {
      const response = await phoneAPI.getPhone();
      const phoneNumber = response.data || "";

      const preFilledMessage =
        "Halo, saya ingin bertanya tentang layanan logistik Racana Diponegoro.";

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        preFilledMessage
      )}`;

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      alert("Gagal mengambil nomor WhatsApp. Coba lagi nanti.");
      console.error("WA Error:", error);
    }
  };

  const [showChatInfo, setShowChatInfo] = useState(true);

  return (
    <footer className="bg-blue-900 text-white">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r text-white bg-clip-text">
                  Racana Diponegoro
                </h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Sistem manajemen logistik terintegrasi untuk kemudahan
                  peminjaman barang bagi anggota Racana Diponegoro.
                </p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-semibold text-white mb-3">Ikuti Kami</h4>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Tautan Cepat
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Layanan</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.href}
                      className="text-slate-400 hover:text-white transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      <span>{service.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Kontak Kami
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <li key={index}>
                    <a
                      href={contact.href}
                      className="text-slate-400 hover:text-white transition-all duration-300 flex items-start space-x-3 group"
                    >
                      <contact.icon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">
                        {contact.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-blue-900">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-slate-400 text-sm">
                © {currentYear} Racana Diponegoro. All rights reserved.
              </div>

              {/* Development Info */}
              <div className="text-slate-500 text-xs">
                Dibangun dengan ❤️ untuk Racana Diponegoro
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip */}
          <div className="absolute -top-2 -right-2 bg-white text-green-600 text-xs font-semibold px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>Tanya via WhatsApp</span>
            </div>
            <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white transform rotate-45"></div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group relative"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.248-6.189-3.515-8.452" />
            </svg>

            {/* Ping Animation */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Floating Chat Info (optional) */}
      {showChatInfo && (
        <div className="fixed bottom-24 right-6 z-40 animate-bounce">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Butuh Bantuan?
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Klik untuk chat via WhatsApp
                </p>
              </div>
              <button
                onClick={() => setShowChatInfo(false)}
                className="text-slate-400 hover:text-slate-600 text-xs transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
