import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js'
import LoginPage from "../pages/admin/LoginPage";
import Dashboard from "../pages/admin/Dashboard";
import NavbarAdmin from "../components/navbar/adminNavbar";
import KatalogAdminPage from "../pages/admin/KatalogAdminPage";
import CreateKatalogPage from "../pages/admin/CreateKatalogPage";
import DetailAdminPage from "../pages/admin/DetailAdminPage";
import EditKatalogPage from "../pages/admin/EditKatalogPage";
import DaftarPeminjam from "../pages/admin/DaftarPeminjam";
import RiwayatPage from "../pages/admin/RiwayatPage";
import Settings from "../pages/admin/Settings";
import FaqAdminPage from "../components/settings/faqAdminPage";
import ProtectedRoute from "../components/protectedRoute";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Maaf, halaman yang Anda cari tidak ditemukan. Silakan kembali ke
          beranda.
        </p>
        <a
          href="/admin"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 inline-block"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const PublicRoute = ({ children }) => {
    const [checking, setChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        setChecking(false);
      };
      
      checkAuth();
    }, []);

    if (checking) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return isLoggedIn ? <Navigate to="/admin" replace /> : children;
  };

  return (
    <div className="App">
      <Routes>
        {/* Public Route - hanya bisa diakses jika belum login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes - hanya bisa diakses jika sudah login */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/daftarkatalog" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <KatalogAdminPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/createkatalog" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <CreateKatalogPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/detailkatalog/:id" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <DetailAdminPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/editkatalog/:id" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <EditKatalogPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/daftarpeminjam" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <DaftarPeminjam />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/riwayat" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <RiwayatPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/faqadminpage" 
          element={
            <ProtectedRoute>
              <div className="hidden md:block">
                <NavbarAdmin />
              </div>
              <FaqAdminPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback route untuk 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default AdminLayout;