import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Package,
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import katalogAPI from '../../api/katalogAPI';

const EditKatalogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'outdoor',
    status: 'tersedia',
    harga: '',
    stok: '',
    maksPeminjaman: '',
    kualitas: 'Bagus',
    deskripsi: '',
    lokasi: 'Gudang Utama',
    spesifikasi: ['']
  });

  useEffect(() => {
    const loadBarangData = async () => {
      try {
        setIsLoading(true);
        const response = await katalogAPI.getById(id);
        
        console.log('📦 Full API Response:', response); // Debug log
        
        // Cek struktur response yang sebenarnya
        const barang = response.data || response;
        
        console.log('🔍 Barang data:', barang); // Debug log
        
        if (!barang) {
          throw new Error('Data barang tidak ditemukan');
        }

        // Set form data dengan validasi yang lebih ketat
        setFormData({
          nama: barang.nama || '',
          kategori: barang.kategori || 'outdoor',
          status: barang.status || 'tersedia',
          harga: barang.harga ? barang.harga.toString() : '',
          stok: barang.stok ? barang.stok.toString() : '',
          maksPeminjaman: barang.maks_peminjaman || barang.maksPeminjaman || '',
          kualitas: barang.kualitas || 'Bagus',
          deskripsi: barang.deskripsi || '',
          lokasi: barang.lokasi || 'Gudang Utama',
          spesifikasi: Array.isArray(barang.spesifikasi) && barang.spesifikasi.length > 0 
            ? barang.spesifikasi 
            : ['']
        });

        // Handle gambar - sesuaikan dengan struktur data dari API
        if (Array.isArray(barang.gambar) && barang.gambar.length > 0) {
          setExistingImages(barang.gambar.map((imgUrl, index) => ({
            id: `existing-${index}`,
            url: imgUrl,
            name: `gambar-${index + 1}.jpg`,
            isExisting: true
          })));
        } else if (barang.gambar && typeof barang.gambar === 'string') {
          // Jika gambar adalah string tunggal
          setExistingImages([{
            id: 'existing-0',
            url: barang.gambar,
            name: 'gambar-1.jpg',
            isExisting: true
          }]);
        } else {
          setExistingImages([]);
        }

        console.log('✅ Data loaded successfully');
        
      } catch (error) {
        console.error('❌ Error loading barang data:', error);
        alert('Gagal memuat data barang: ' + (error.message || 'Data tidak ditemukan'));
        navigate('/admin/daftarkatalog');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadBarangData();
    } else {
      alert('ID barang tidak valid');
      navigate('/admin/daftarkatalog');
    }
  }, [id, navigate]);

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Harap pilih file gambar yang valid');
      return;
    }

    // Cek jumlah gambar tidak melebihi 10
    const allImages = [...existingImages, ...images];
    if (allImages.length + imageFiles.length > 10) {
      alert('Maksimal 10 gambar yang dapat diupload');
      return;
    }

    // Cek ukuran file (maksimal 5MB)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Beberapa file melebihi ukuran maksimal 5MB');
      return;
    }

    // Tambahkan file ke state
    setImages(prev => [...prev, ...imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      isNew: true
    }))]);
  };

  const removeImage = (id) => {
    if (id.startsWith('existing-')) {
      setExistingImages(prev => prev.filter(img => img.id !== id));
    } else {
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpesifikasiChange = (index, value) => {
    const newSpesifikasi = [...formData.spesifikasi];
    newSpesifikasi[index] = value;
    setFormData(prev => ({
      ...prev,
      spesifikasi: newSpesifikasi
    }));
  };

  const addSpesifikasi = () => {
    setFormData(prev => ({
      ...prev,
      spesifikasi: [...prev.spesifikasi, '']
    }));
  };

  const removeSpesifikasi = (index) => {
    if (formData.spesifikasi.length > 1) {
      const newSpesifikasi = formData.spesifikasi.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        spesifikasi: newSpesifikasi
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    const allImages = [...existingImages, ...images];
    if (allImages.length === 0) {
      alert('Harap tambahkan minimal 1 gambar');
      return;
    }

    if (!formData.nama || !formData.harga || !formData.stok || !formData.deskripsi || !formData.maksPeminjaman) {
      alert('Harap isi semua field yang wajib diisi');
      return;
    }

    if (formData.deskripsi.length < 50) {
      alert('Deskripsi minimal 50 karakter');
      return;
    }

    try {
      setLoading(true);

      // Filter spesifikasi yang tidak kosong
      const filteredSpesifikasi = formData.spesifikasi.filter(spec => spec.trim() !== '');

      // Prepare data untuk API
      const submitData = {
        nama: formData.nama,
        kategori: formData.kategori,
        status: formData.status,
        harga: parseFloat(formData.harga),
        stok: parseInt(formData.stok),
        maksPeminjaman: formData.maksPeminjaman,
        kualitas: formData.kualitas,
        deskripsi: formData.deskripsi,
        lokasi: formData.lokasi,
        spesifikasi: filteredSpesifikasi,
        gambar: images.map(img => img.file) // Kirim file gambar baru
      };

      // Jika ada gambar existing, tambahkan URL-nya
      const existingImageUrls = existingImages.map(img => img.url);
      if (existingImageUrls.length > 0) {
        submitData.gambar = [...existingImageUrls, ...submitData.gambar];
      }

      console.log('🚀 Sending data to API:', submitData);

      // Send to API
      await katalogAPI.update(id, submitData);
      
      alert('Barang berhasil diperbarui!');
      navigate('/admin/daftarkatalog');
    } catch (error) {
      console.error('❌ Error updating katalog:', error);
      alert(error.message || 'Terjadi kesalahan saat memperbarui barang');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-300 rounded-2xl mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-4">Memuat data barang...</p>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [...existingImages, ...images];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/daftarkatalog')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Katalog</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Barang</h1>
              <p className="text-gray-600">Perbarui informasi barang dalam katalog inventaris</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gambar Barang</h2>
            <p className="text-gray-600 mb-4">Gambar saat ini: {allImages.length} gambar</p>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                multiple
                accept="image/*"
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag gambar baru ke sini'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Format yang didukung: JPG, PNG, GIF (Maksimal 5MB per file)
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Rekomendasi: Minimal 1 gambar, maksimal 10 gambar
                  </p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {allImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview Gambar ({allImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.isExisting ? image.url : URL.createObjectURL(image.file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Gambar+Error';
                        }}
                      />
                      {image.isExisting && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Existing
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Tenda Dome 4 Person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="tidak_tersedia">Tidak Tersedia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga per Hari (Rp) *
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Tersedia *
                </label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal Peminjaman *
                </label>
                <input
                  type="text"
                  name="maksPeminjaman"
                  value={formData.maksPeminjaman}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 7 hari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kualitas *
                </label>
                <select
                  name="kualitas"
                  value={formData.kualitas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Sangat Bagus">Sangat Bagus</option>
                  <option value="Bagus">Bagus</option>
                  <option value="Baik">Baik</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Penyimpanan *
                </label>
                <select
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Gudang Utama">Gudang Utama</option>
                  <option value="Gudang A">Gudang A</option>
                  <option value="Gudang B">Gudang B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Barang</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap *
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jelaskan detail barang, fitur, keunggulan, dan informasi penting lainnya..."
              />
              <p className="text-gray-500 text-sm mt-2">
                {formData.deskripsi.length} karakter. Minimal 50 karakter.
              </p>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Spesifikasi Teknis</h2>
              <button
                type="button"
                onClick={addSpesifikasi}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Spesifikasi</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.spesifikasi.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => handleSpesifikasiChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Spesifikasi ${index + 1} (Contoh: Material: Polyester 210T)`}
                  />
                  {formData.spesifikasi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpesifikasi(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/daftarkatalog')}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKatalogPage;