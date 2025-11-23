import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Menu, X, Home, Package, Users, History, Settings, LogOut } from 'lucide-react';
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
            className="text-white p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          {/* Sidebar Menu */}
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="bg-blue-900 p-4 flex items-center justify-between">
              <img
                src={logo}
                className="h-10 object-contain"
                alt="Logo Racana Diponegoro"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-white p-1 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <div
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-3 p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                );
              })}

              {/* Logout Button */}
              <div
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-3 p-3 rounded-lg mb-2 cursor-pointer text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                Admin Panel
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Logout</h3>
            <p className="mb-6">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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