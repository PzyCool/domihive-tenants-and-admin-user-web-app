// src/components/home/properties/components/PropertyDetailsPage/components/tabs/MediaTab/RoomGallery.jsx
import React, { useState } from 'react';

const RoomGallery = ({ property }) => {
  const defaultImages = [
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1545323157-f6f63c0d66a7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop'
  ];

  const roomCategories = [
    {
      id: 'living',
      name: 'Living Room',
      images: defaultImages.slice(0, 3)
    },
    {
      id: 'bedroom',
      name: 'Bedrooms',
      images: defaultImages.slice(1, 4)
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      images: defaultImages.slice(2, 5)
    },
    {
      id: 'bathroom',
      name: 'Bathrooms',
      images: defaultImages.slice(3, 6)
    }
  ];

  const [selectedRoom, setSelectedRoom] = useState(roomCategories[0]);

  return (
    <div className="room-gallery">
      <div className="flex flex-wrap gap-2 mb-6">
        {roomCategories.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedRoom.id === room.id
                ? 'bg-[#9f7539] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedRoom.images.map((image, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
          >
            <img
              src={image}
              alt={`${selectedRoom.name} ${index + 1}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomGallery;