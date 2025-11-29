import React, { useState } from 'react';
import { RentalListing } from '../types';
import { MapPin, Phone, User, Info, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: RentalListing;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, isAdmin, onDelete }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow duration-300">
        {/* Image Gallery */}
        {listing.images.length > 0 ? (
          <div className="relative h-56 bg-slate-200 group">
            <img 
              src={listing.images[activeImage]} 
              alt="Room" 
              onClick={openLightbox}
              className="w-full h-full object-cover cursor-zoom-in"
            />
            {listing.images.length > 1 && (
              <>
                <div className="absolute bottom-2 right-2 flex gap-1 bg-black/50 p-1 rounded-full z-10">
                  {listing.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveImage(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${idx === activeImage ? 'bg-white scale-125' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                {/* Navigation Arrows on Card */}
                <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="h-24 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            ไม่มีรูปภาพ
          </div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-xl font-bold text-blue-800">{listing.price} <span className="text-sm font-normal text-slate-500">/ เดือน</span></h3>
             {isAdmin && onDelete && (
                 <button 
                  onClick={() => {
                      if(window.confirm('ต้องการลบโพสต์นี้ใช่ไหม?')) {
                          onDelete(listing.id);
                      }
                  }}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                 >
                     <Trash2 size={18} />
                 </button>
             )}
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="font-semibold">{listing.location}</span>
            </div>
            
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="whitespace-pre-line text-slate-600">{listing.details}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
               <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{listing.contactName}</span>
               </div>
               <a href={`tel:${listing.contactPhone}`} className="flex items-center gap-2 text-blue-600 font-medium hover:underline">
                  <Phone className="w-4 h-4" />
                  <span>{listing.contactPhone}</span>
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeLightbox}
        >
            <button 
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            >
                <X size={32} />
            </button>

            <div 
                className="relative max-w-full max-h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()} 
            >
                <img 
                    src={listing.images[activeImage]} 
                    alt="Full size" 
                    className="max-w-full max-h-[90vh] object-contain rounded-sm"
                />

                {listing.images.length > 1 && (
                    <>
                        <button 
                            onClick={prevImage}
                            className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                            <ChevronRight size={24} />
                        </button>
                        
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                           {listing.images.map((_, idx) => (
                             <div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full ${idx === activeImage ? 'bg-white' : 'bg-white/30'}`}
                             />
                           ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </>
  );
};

export default ListingCard;