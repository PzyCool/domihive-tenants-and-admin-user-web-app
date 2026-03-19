import React, { useState } from 'react';

const RoomGallery = ({ property }) => {
  const images = Array.isArray(property?.images)
    ? property.images.filter(Boolean)
    : [property?.image].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(null);

  const closeModal = () => setActiveIndex(null);
  const nextImage = () => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  if (!images.length) {
    return (
      <div className="mb-8 bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center">
        <h3 className="text-xl font-bold text-[#0e1f42] mb-2">Room Gallery</h3>
        <p className="text-sm text-[#64748b]">No photos uploaded for this property yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="room-gallery mb-8">
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-4">Room Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setActiveIndex(index)}
              className="rounded-xl overflow-hidden border border-[#e2e8f0] hover:shadow-md transition-shadow"
            >
              <img src={image} alt={`Property media ${index + 1}`} className="w-full h-44 object-cover" />
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-[1400] bg-black/70 p-4 flex items-center justify-center" onClick={closeModal}>
          <div className="relative bg-white rounded-2xl w-full max-w-5xl p-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white border border-[#e2e8f0]"
            >
              <i className="fas fa-times text-[#0e1f42]" />
            </button>
            <div className="relative">
              <img src={images[activeIndex]} alt="Selected property media" className="w-full max-h-[75vh] object-contain rounded-xl bg-black" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-[#e2e8f0]"
                  >
                    <i className="fas fa-chevron-left text-[#0e1f42]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-[#e2e8f0]"
                  >
                    <i className="fas fa-chevron-right text-[#0e1f42]" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomGallery;
