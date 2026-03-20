// src/dashboards/rent/components/property-details/components/tabs/MediaTab/RoomGallery.jsx
import React, { useState } from 'react';

const RoomGallery = ({ property }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const rooms = [
    {
      id: 1,
      name: 'Living Room',
      description: 'Spacious living area with modern furniture and natural lighting',
      images: [
        'https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 2,
      name: 'Master Bedroom',
      description: 'Luxurious master suite with ensuite bathroom and walk-in closet',
      images: [
        'https://images.unsplash.com/photo-1616594039633-cd862f1d48a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 3,
      name: 'Kitchen',
      description: 'Modern fully-equipped kitchen with premium appliances',
      images: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-043788447eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588854337236-6889d631faa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 4,
      name: 'Bathroom',
      description: 'Premium bathroom with marble finishes and modern fixtures',
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1620625515032-6ed0c1790c6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1575939238474-c8ada13b2724?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  const openModal = (room, index = 0) => {
    setSelectedRoom(room);
    setModalImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedRoom(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedRoom) {
      setModalImageIndex((prev) => 
        prev === selectedRoom.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      setModalImageIndex((prev) => 
        prev === 0 ? selectedRoom.images.length - 1 : prev - 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    setModalImageIndex(index);
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <div className="room-gallery mb-8">
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-6">Room by Room Gallery</h3>
        
        <div className="space-y-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-[#0e1f42] mb-2">{room.name}</h4>
                <p className="text-[#64748b]">{room.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {room.images.slice(0, 4).map((image, index) => (
                  <div 
                    key={index} 
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => openModal(room, index)}
                  >
                    <img
                      src={image}
                      alt={`${room.name} - View ${index + 1}`}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              
              {room.images.length > 4 && (
                <button 
                  onClick={() => openModal(room, 0)}
                  className="mt-6 px-4 py-2 text-[#9f7539] hover:text-[#b58a4a] font-medium transition-colors duration-300 flex items-center gap-2 hover:underline"
                >
                  View more photos of {room.name} ({room.images.length} total) →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for viewing all photos */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={handleBackdropClick}
        >
          <div className="relative w-full max-w-4xl h-full max-h-[80vh] bg-white rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-lg"
            >
              <svg 
                className="w-6 h-6 text-gray-800" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Image */}
            <div className="relative h-2/3 bg-gray-900">
              <img
                src={selectedRoom.images[modalImageIndex]}
                alt={`${selectedRoom.name} - Image ${modalImageIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* Navigation arrows */}
              {selectedRoom.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-lg"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-lg"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                {modalImageIndex + 1} / {selectedRoom.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="h-1/3 bg-gray-50 p-4 overflow-y-auto">
              <h4 className="text-lg font-semibold text-[#0e1f42] mb-3">
                {selectedRoom.name} - All Photos
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {selectedRoom.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      index === modalImageIndex 
                        ? 'border-[#9f7539] scale-105' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    {index === modalImageIndex && (
                      <div className="absolute inset-0 bg-[#9f7539]/10"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomGallery;