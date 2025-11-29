import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { getListings, saveListing, compressImage } from '../services/storageService';
import { RentalListing } from '../types';
import { Search, Plus, Image as ImageIcon, Loader2, X, RefreshCw } from 'lucide-react';

const simpleId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const HomePage: React.FC = () => {
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    price: '',
    details: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getListings();
        setListings(data);
      } catch (e) {
        console.error("Failed to load", e);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredListings = listings.filter(item => 
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 3 - selectedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);

      if (filesToAdd.length > 0) {
        setSelectedImages(prev => [...prev, ...filesToAdd]);
        
        // Generate previews
        filesToAdd.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.location) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Compress Images
      const compressedImages = await Promise.all(
        selectedImages.map(file => compressImage(file))
      );

      // 2. Create Object
      const newListing: RentalListing = {
        id: simpleId(),
        contactName: formData.name,
        contactPhone: formData.phone,
        location: formData.location,
        price: formData.price,
        details: formData.details,
        images: compressedImages,
        timestamp: Date.now()
      };

      // 3. Save
      const updatedListings = await saveListing(newListing);
      setListings(updatedListings);

      // 4. Reset Form
      setFormData({ name: '', phone: '', location: '', price: '', details: '' });
      setSelectedImages([]);
      setPreviewImages([]);
      alert('โพสต์ข้อมูลสำเร็จ');
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ (ไฟล์อาจใหญ่เกินไป)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {/* Search Bar */}
        <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-blue-500" />
                </div>
                <input 
                    type="text" 
                    placeholder="ค้นหาสถานที่ (เช่น หาดใหญ่, มอ., คอหงส์)" 
                    className="block w-full pl-10 pr-3 py-3 border border-blue-100 rounded-xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>
            <button 
                onClick={loadData}
                className="bg-white border border-blue-100 text-blue-500 p-3 rounded-xl shadow-sm hover:bg-blue-50"
            >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>

        {/* Listings Feed */}
        <div className="space-y-6">
           {isLoading && listings.length === 0 ? (
               <div className="flex justify-center py-12">
                   <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
               </div>
           ) : filteredListings.length > 0 ? (
             filteredListings.map(listing => (
               <ListingCard key={listing.id} listing={listing} />
             ))
           ) : (
             <div className="text-center py-12 text-slate-400">
               <p>ไม่พบข้อมูลที่ค้นหา</p>
             </div>
           )}
        </div>

        <div className="my-12 border-t border-slate-200"></div>

        {/* Post Form */}
        <div className="bg-blue-50 rounded-xl p-6 shadow-inner border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            ลงประกาศที่พัก (ฟรี)
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">รูปภาพ (สูงสุด 3 รูป)</label>
              <div className="flex flex-wrap gap-3">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {selectedImages.length < 3 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                  >
                    <ImageIcon size={20} />
                    <span className="text-xs mt-1">เพิ่มรูป</span>
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ติดต่อ *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น พี่มด"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่ / โซน *</label>
              <input 
                required
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="เช่น ซอยทุ่งรี, หน้าม.อ., คอหงส์"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท/เดือน)</label>
               <input 
                  type="text" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="เช่น 3,500"
               />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
              <textarea 
                rows={3}
                value={formData.details}
                onChange={e => setFormData({...formData, details: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="รายละเอียดห้อง ค่าน้ำค่าไฟ สิ่งอำนวยความสะดวก..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> กำลังบันทึก...
                </>
              ) : (
                'โพสต์ประกาศ'
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-2">
              * ไม่ต้องสมัครสมาชิก ระบบจะบันทึกข้อมูลทันที
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default HomePage;