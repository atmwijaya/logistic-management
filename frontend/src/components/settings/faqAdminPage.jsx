import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import faqAPI from '../../api/faqAPI';

const FaqAdminPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ 
    question: '', 
    answer: '', 
    category: 'General',
    is_active: true 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: 'General', is_active: true });
  
  const navigate = useNavigate();

  // Load FAQs dari backend
  const loadFAQs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await faqAPI.getAllForAdmin();
      
      if (result.success) {
        setFaqs(result.data || []);
      } else {
        setError(result.message || 'Gagal memuat data FAQ');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data FAQ');
      console.error('Error loading FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tambah FAQ baru
  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      setError('Pertanyaan dan jawaban harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await faqAPI.create(newFaq);
      
      if (result.success) {
        setSuccess('FAQ berhasil ditambahkan');
        setNewFaq({ question: '', answer: '', category: 'General', is_active: true });
        await loadFAQs(); // Reload data
      } else {
        setError(result.message || 'Gagal menambahkan FAQ');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menambahkan FAQ');
      console.error('Error adding FAQ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit FAQ
  const handleEditFaq = (faq) => {
    setEditingId(faq.id);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      is_active: faq.is_active
    });
  };

  // Handle update FAQ
  const handleUpdateFaq = async (id) => {
    if (!editForm.question.trim() || !editForm.answer.trim()) {
      setError('Pertanyaan dan jawaban harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await faqAPI.update(id, editForm);
      
      if (result.success) {
        setSuccess('FAQ berhasil diupdate');
        setEditingId(null);
        await loadFAQs(); // Reload data
      } else {
        setError(result.message || 'Gagal mengupdate FAQ');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengupdate FAQ');
      console.error('Error updating FAQ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle hapus FAQ
  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await faqAPI.delete(id);
      
      if (result.success) {
        setSuccess('FAQ berhasil dihapus');
        await loadFAQs(); // Reload data
      } else {
        setError(result.message || 'Gagal menghapus FAQ');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus FAQ');
      console.error('Error deleting FAQ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status FAQ
  const handleToggleStatus = async (id, currentStatus) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await faqAPI.toggleStatus(id, !currentStatus);
      
      if (result.success) {
        setSuccess(`FAQ berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        await loadFAQs(); // Reload data
      } else {
        setError(result.message || 'Gagal mengubah status FAQ');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah status FAQ');
      console.error('Error toggling FAQ status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ question: '', answer: '', category: 'General', is_active: true });
  };

  // Handle settings navigation
  const handleSettings = () => {
    navigate('/admin/settings');
  };

  // Load data saat component mount
  useEffect(() => {
    loadFAQs();
  }, []);

  // Clear messages setelah 5 detik
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin FAQ</h1>
              <p className="text-gray-600 mt-2">Kelola Frequently Asked Questions</p>
            </div>
            <button 
              onClick={handleSettings}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Kembali ke Settings
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Add New FAQ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah FAQ Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pertanyaan
              </label>
              <input
                type="text"
                placeholder="Masukkan pertanyaan..."
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jawaban
              </label>
              <textarea
                placeholder="Masukkan jawaban..."
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="General">General</option>
                <option value="Peminjaman">Peminjaman</option>
                <option value="Pengembalian">Pengembalian</option>
                <option value="Teknis">Teknis</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <button
              onClick={handleAddFaq}
              disabled={loading || !newFaq.question.trim() || !newFaq.answer.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Menambahkan...' : 'Tambah FAQ'}
            </button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Daftar FAQ</h2>
            <span className="text-sm text-gray-500">
              Total: {faqs.length} FAQ
            </span>
          </div>

          {loading && faqs.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat data FAQ...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada data FAQ.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === faq.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pertanyaan
                        </label>
                        <input
                          type="text"
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jawaban
                        </label>
                        <textarea
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kategori
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="General">General</option>
                          <option value="Peminjaman">Peminjaman</option>
                          <option value="Pengembalian">Pengembalian</option>
                          <option value="Teknis">Teknis</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateFaq(faq.id)}
                          disabled={loading || !editForm.question.trim() || !editForm.answer.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{faq.question}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${faqAPI.utils.getStatusColor(faq.is_active)}`}>
                            {faqAPI.utils.getStatusText(faq.is_active)}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${faqAPI.utils.getCategoryColor(faq.category)}`}>
                            {faqAPI.utils.getCategoryText(faq.category)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{faq.answer}</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-500">
                          Dibuat: {faqAPI.utils.formatDate(faq.created_at)}
                          {faq.updated_at && ` | Diupdate: ${faqAPI.utils.formatDate(faq.updated_at)}`}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleToggleStatus(faq.id, faq.is_active)}
                            disabled={loading}
                            className={`px-3 py-1 text-sm rounded ${
                              faq.is_active 
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                          >
                            {faq.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button 
                            onClick={() => handleEditFaq(faq)}
                            disabled={loading}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteFaq(faq.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqAdminPage;