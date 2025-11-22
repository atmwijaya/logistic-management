import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Loader2 } from 'lucide-react';
import faqAPI from '../../api/faqAPI';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 pr-4">
          {question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main FAQ Component
const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load FAQs dari backend
  const loadFAQs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await faqAPI.getAll();
      
      if (result.success) {
        setFaqData(result.data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(result.data
          .map(faq => faq.category)
          .filter(category => category && category.trim() !== '')
        )];
        setCategories(uniqueCategories);
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

  // Load categories
  const loadCategories = async () => {
    try {
      const result = await faqAPI.getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Filter FAQs berdasarkan kategori dan pencarian
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fungsi untuk handle klik tombol Hubungi Kami
  const handleContactClick = () => {
    // Ganti dengan nomor WhatsApp yang sesuai (format: kode negara + nomor tanpa tanda + atau 0)
    const phoneNumber = '6281215452982'; 
    const message = 'Halo, saya memiliki pertanyaan tentang Database Anggota Racana Diponegoro';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Load data saat component mount
  useEffect(() => {
    loadFAQs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Memuat FAQ...
              </h2>
              <p className="text-gray-600">
                Sedang mengambil data dari server
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <HelpCircle className="w-12 h-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Gagal Memuat Data
              </h2>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <button
                onClick={loadFAQs}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-blue-600 mb-4">
              <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering diajukan seputar Database Anggota Racana Diponegoro
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari pertanyaan atau jawaban..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results Info */}
            <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
              <span>
                Menampilkan {filteredFAQs.length} dari {faqData.length} FAQ
              </span>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Reset filter
                </button>
              )}
            </div>
          </div>

          {/* FAQ Items */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada FAQ yang ditemukan
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Coba ubah kata kunci pencarian atau pilih kategori lain'
                  : 'Belum ada FAQ yang tersedia'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredFAQs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openItems.has(faq.id)}
                  onToggle={() => toggleItem(faq.id)}
                />
              ))}
            </div>
          )}

          {/* Contact section */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-blue-50 rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2 sm:mb-3">
                Masih ada pertanyaan?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.
              </p>
              <button 
                onClick={handleContactClick} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                Hubungi Kami
              </button>
            </div>
          </div>

          {/* Last Updated Info */}
          {faqData.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Data terakhir diperbarui: {faqAPI.utils.formatDate(
                  faqData.reduce((latest, faq) => {
                    const faqDate = new Date(faq.updated_at || faq.created_at);
                    return faqDate > latest ? faqDate : latest;
                  }, new Date(0))
                )}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FAQ;