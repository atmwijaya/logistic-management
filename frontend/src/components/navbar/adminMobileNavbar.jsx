import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Menu, X, Home, Package, Users, History, Settings, LogOut, ChevronDown } from 'lucide-react';
import logo from "../../assets/Dewasaku_Putih.png";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

const AdminMobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { path: "/admin", name: "Beranda", icon: Home },
    { path: "/admin/daftarkatalog", name: "Katalog", icon: Package },
    { path: "/admin/daftarpeminjam", name: "Peminjaman", icon: Users },
    { path: "/admin/riwayat", name: "Riwayat", icon: History },
    { path: "/admin/settings", name: "Settings", icon: Settings },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error logging out:', error)
      }
      
      localStorage.removeItem('admin_session')
      localStorage.removeItem('admin_user')
      
      console.log("Admin logged out");
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setShowLogoutModal(false)
      setIsOpen(false)
    }
  };

  return (
    <>
      {/* Mobile Navbar Header */}
      <nav className="md:hidden bg-blue-900 px-4 py-3 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/admin")}
          >
            <img
              src={logo}
              className="h-10 object-contain"
              alt="Logo Racana Diponegoro"
            />
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 rounded-lg hover:bg-blue-800 transition-colors duration-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Dropdown Menu */}
      <div className={`md:hidden fixed inset-x-0 top-16 z-50 transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white shadow-2xl border-t border-blue-200 mx-4 rounded-b-2xl overflow-hidden max-h-80 overflow-y-auto">
          {/* Menu Items */}
          <div className="py-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-3 p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${index * 80}ms` : '0ms'
                  }}
                >
                  <Icon 
                    size={20} 
                    className={isActive ? 'text-blue-600' : 'text-gray-500'} 
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}

            {/* Logout Button */}
            <div
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center space-x-3 p-4 border-b border-gray-100 cursor-pointer text-red-600 hover:bg-red-50 transition-all duration-300 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
              style={{
                transitionDelay: isOpen ? `${navItems.length * 80}ms` : '0ms'
              }}
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-blue-50 py-3 px-4">
            <div className="text-center text-sm text-blue-700 font-medium">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 -z-10 transition-opacity duration-500"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Background overlay untuk mencegah scroll */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-0 z-40" />
      )}

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Logout</h3>
            <p className="mb-6 text-gray-600">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMobileNavbar;