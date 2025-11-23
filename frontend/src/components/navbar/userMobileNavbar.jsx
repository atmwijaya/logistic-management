import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Package, HelpCircle } from 'lucide-react';
import logo from '../../assets/Dewasaku_Putih.png';

const UserMobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', name: 'Beranda', icon: Home },
    { path: '/katalog', name: 'Katalog', icon: Package },
    { path: '/faq', name: 'FAQ', icon: HelpCircle }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navbar Header */}
      <nav className="md:hidden bg-blue-900 px-4 py-3 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/')}
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
          <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl">
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
            <div className="p-4">
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
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                Logistik Manager
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
    </>
  );
};

export default UserMobileNavbar;