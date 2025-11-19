import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "../pages/admin/LoginPage";
import Dashboard from "../pages/admin/Dashboard";
import NavbarAdmin from "../components/navbar/adminNavbar";
import KatalogAdminPage from "../pages/admin/KatalogAdminPage";
import CreateKatalogPage from "../pages/admin/CreateKatalogPage";
import DetailAdminPage from "../pages/admin/DetailAdminPage";
import EditKatalogPage from "../pages/admin/EditKatalogPage";
import DaftarPeminjam from "../pages/admin/DaftarPeminjam";

// Komponen untuk halaman 404
const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
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
          href="/"
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

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <div className="App">
      <div className="hidden md:block">
        <NavbarAdmin />
      </div>

      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/daftarkatalog" element={<KatalogAdminPage />} />
          <Route path="/admin/createkatalog" element={<CreateKatalogPage />} />
          <Route path="/admin/detailkatalog/:id" element={<DetailAdminPage />} />
          <Route path="/admin/editkatalog/:id" element={<EditKatalogPage />} />
          <Route path="/admin/daftarpeminjam" element={<DaftarPeminjam />} />

          {/* Fallback route untuk 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
