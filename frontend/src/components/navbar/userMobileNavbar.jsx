import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Package, HelpCircle, ChevronDown } from 'lucide-react';
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
            className="text-white p-2 rounded-lg hover:bg-blue-800 transition-colors duration-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Dropdown Menu - Sekarang menjadi bagian dari nav */}
        <div className={`absolute left-0 right-0 bg-white shadow-2xl border-t border-blue-200 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          {/* Menu Items */}
          <div className="py-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-3 p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <Icon 
                    size={22} 
                    className={isActive ? 'text-blue-600' : 'text-gray-500'} 
                  />
                  <span className="font-medium text-lg">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-blue-50 py-3 px-4">
            <div className="text-center text-sm text-blue-700 font-medium">
              Logistik Manager
            </div>
          </div>
        </div>
      </nav>

      {/* Background overlay untuk mencegah scroll - hanya muncul ketika menu terbuka */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-transparent z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default UserMobileNavbar;