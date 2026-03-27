// src/components/home/properties/components/utils/propertyData.js
const NIGERIAN_PROPERTY_IMAGES = {
  luxury: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
  ],
  standard: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
  ],
  estate: [
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop',
  ],
  interior: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1616594039964-3f1cb070f2d3?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=1200&h=800&fit=crop',
  ],
  fallback: [
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1545323157-f6f63c0d66a7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  ]
};

const LAGOS_AREAS = {
  island: {
    locations: [
      'Ikoyi', 'Lekki Phase 1', 'Victoria Island', 'Ajah', 'Sangotedo',
      'Chevron', 'Oniru', 'Banana Island', 'Lekki Phase 2', 
      'Victoria Garden City (VGC)', 'Lekki Scheme 2', 'Osapa London',
      'Jakande', 'Awoyaya', 'Abraham Adesanya', 'Lakowe', 'Ibeju Lekki',
      'Marina', 'Dolphin Estate', '1004 Estate'
    ],
    priceRange: { min: 3000000, max: 10000000 },
    propertyTypes: ['Luxury Apartment', 'Penthouse', 'Duplex', 'Terrace House']
  },
  mainland: {
    locations: [
      'Ikeja', 'Ikeja GRA', 'Yaba', 'Surulere', 'Ojota', 'Oshodi', 'Ilupeju',
      'Egbeda', 'Maryland', 'Ikorodu', 'Agege', 'Festac Town', 'Gbagada',
      'Mushin', 'Mende', 'Ogba', 'Alausa', 'Anthony', 'Palmgroove'
    ],
    priceRange: { min: 800000, max: 5000000 },
    propertyTypes: ['Flat', 'Self-Contain', 'Mini-Flat', 'Bungalow', 'Apartment']
  }
};

const DELTA_AREAS = {
  north: {
    areaLabel: 'Delta North',
    locations: ['Asaba', 'Ibusa', 'Okpanam', 'Agbor', 'Issele-Uku'],
    priceRange: { min: 700000, max: 4500000 },
    propertyTypes: ['Apartment', 'Duplex', 'Flat', 'Bungalow']
  },
  central: {
    areaLabel: 'Delta Central',
    locations: ['Warri', 'Effurun', 'Sapele', 'Ughelli', 'Abraka'],
    priceRange: { min: 800000, max: 5000000 },
    propertyTypes: ['Apartment', 'Duplex', 'Terrace', 'Flat']
  },
  south: {
    areaLabel: 'Delta South',
    locations: ['Ozoro', 'Oleh', 'Burutu', 'Koko', 'Bomadi'],
    priceRange: { min: 650000, max: 4000000 },
    propertyTypes: ['Apartment', 'Flat', 'Mini-Flat', 'Bungalow']
  }
};

const MANAGEMENT_TYPES = {
  domihive_managed: {
    name: 'DomiHive Managed',
    description: 'Full property management by DomiHive.',
    badgeColor: '#9f7539',
    features: [
      'Full maintenance included',
      '24/7 DomiHive support',
      'Direct complaint handling'
    ]
  },
  estate_managed: {
    name: 'Estate Managed',
    description: 'Property within a managed estate.',
    badgeColor: '#0e1f42',
    features: [
      'Estate maintenance team',
      'Gated community security',
      'Shared amenities'
    ]
  },
  landlord_managed: {
    name: 'Landlord Managed',
    description: 'Direct management by property owner.',
    badgeColor: '#10b981',
    features: [
      'Direct landlord communication',
      'On-site landlord support',
      'Flexible arrangements'
    ]
  }
};

const generateAmenities = (bedrooms, managementType) => {
  const baseAmenities = ['24/7 Security', 'Constant Water Supply', 'Parking Space'];
  
  if (bedrooms >= 3) {
    baseAmenities.push('Air Conditioning', 'Generator');
  }
  
  if (managementType === 'domihive_managed') {
    baseAmenities.push('DomiHive Maintenance', 'Online Rent Payment');
  } else if (managementType === 'estate_managed') {
    baseAmenities.push('Gated Estate', 'Estate Maintenance');
  }
  
  const additional = ['WiFi Ready', 'CCTV', 'Waste Disposal'];
  if (Math.random() > 0.5) baseAmenities.push(additional[Math.floor(Math.random() * additional.length)]);
  
  return baseAmenities;
};

const generateEstateAmenities = () => {
  const estateAmenities = ['Swimming Pool', 'Gym', 'Children Playground'];
  return estateAmenities.slice(0, 1 + Math.floor(Math.random() * 2));
};

export const generateNigerianProperties = (count = 80) => {
  const properties = [];
  const managementTypes = Object.keys(MANAGEMENT_TYPES);
  
  for (let i = 1; i <= count; i++) {
    const state = Math.random() > 0.8 ? 'Delta' : 'Lagos';
    const isLagos = state === 'Lagos';
    const areaType = isLagos
      ? (Math.random() > 0.4 ? 'island' : 'mainland')
      : (['north', 'central', 'south'][Math.floor(Math.random() * 3)]);
    const areaData = isLagos ? LAGOS_AREAS[areaType] : DELTA_AREAS[areaType];
    const areaLabel = isLagos ? (areaType === 'island' ? 'Lagos Island' : 'Lagos Mainland') : areaData.areaLabel;
    
    const managementType = managementTypes[Math.floor(Math.random() * managementTypes.length)];
    const mgmtConfig = MANAGEMENT_TYPES[managementType];
    
    const location = areaData.locations[Math.floor(Math.random() * areaData.locations.length)];
    
    let price;
    if (isLagos && areaType === 'island') {
      price = mgmtConfig.name === 'DomiHive Managed' 
        ? 3500000 + Math.random() * 6500000
        : 3000000 + Math.random() * 5000000;
    } else if (isLagos) {
      price = mgmtConfig.name === 'DomiHive Managed'
        ? 1200000 + Math.random() * 2800000
        : 800000 + Math.random() * 2200000;
    } else {
      price = areaData.priceRange.min + Math.random() * (areaData.priceRange.max - areaData.priceRange.min);
    }
    
    let bedrooms;
    const rand = Math.random();
    if (rand < 0.3) bedrooms = 2;
    else if (rand < 0.6) bedrooms = 3;
    else if (rand < 0.8) bedrooms = 1;
    else if (rand < 0.95) bedrooms = 4;
    else bedrooms = 5;
    
    const propertyType = areaData.propertyTypes[
      Math.floor(Math.random() * areaData.propertyTypes.length)
    ];
    
    const imageSet = isLagos && areaType === 'island' ? 'luxury' : 'standard';
    const images = [
      NIGERIAN_PROPERTY_IMAGES[imageSet][Math.floor(Math.random() * NIGERIAN_PROPERTY_IMAGES[imageSet].length)],
      NIGERIAN_PROPERTY_IMAGES.interior[Math.floor(Math.random() * NIGERIAN_PROPERTY_IMAGES.interior.length)]
    ];
    
    const forRent = Math.random() > 0.2;
    
    const property = {
      id: `property_${i.toString().padStart(3, '0')}`,
      title: `${bedrooms} Bedroom ${propertyType} in ${location}`,
      price: Math.round(price),
      location: `${location}, ${areaLabel}, ${state}`,
      state,
      area: areaLabel,
      locationName: location,
      areaType: areaType,
      bedrooms: bedrooms,
      bathrooms: Math.max(1, bedrooms - (Math.random() > 0.7 ? 0 : 1)),
      size: `${Math.round(60 + (bedrooms * 30) + Math.random() * 50)} sqm`,
      propertyType: propertyType,
      managementType: managementType,
      managementName: mgmtConfig.name,
      managementColor: mgmtConfig.badgeColor,
      description: `Beautiful ${bedrooms}-bedroom ${propertyType.toLowerCase()} in prime ${location}. ${mgmtConfig.description}`,
      images: images,
      isVerified: Math.random() > 0.2,
      isFeatured: Math.random() > 0.8,
      isNew: i > 60,
      amenities: generateAmenities(bedrooms, managementType),
      features: mgmtConfig.features,
      dateAdded: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      maintenanceIncluded: managementType === 'domihive_managed',
      estateAmenities: managementType === 'estate_managed' ? generateEstateAmenities() : [],
      landlordPresence: managementType === 'landlord_managed' && Math.random() > 0.5,
      isNegotiable: Math.random() > 0.7,
      isEstate: managementType === 'estate_managed',
      status: Math.random() > 0.8 ? 'rented' : 'available',
      forRent: forRent
    };
    
    properties.push(property);
  }
  
  return properties;
};

export { LAGOS_AREAS, MANAGEMENT_TYPES, NIGERIAN_PROPERTY_IMAGES };
