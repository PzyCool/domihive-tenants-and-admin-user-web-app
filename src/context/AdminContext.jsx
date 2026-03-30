import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ADMIN_STORAGE_BACKUP_KEY,
  ADMIN_STORAGE_KEY,
  readAdminStorage,
  writeAdminStorage
} from './adminPersistence';

const ADMIN_APPLICATION_INBOX_KEY = 'domihive_admin_applications_inbox_v1';

const AdminContext = createContext(null);
const defaultProperties = [
  // property 1
  {
    id: "prop-001",
    title: "3 Bedroom Luxury Apartment",
    state: "Lagos",
    area: "Ikoyi",
    location: "Lekki Phase 1",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    rent: 2800000, // fallback/base rent
    status: "Published",
    tag: "Estate",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",

    // optional property-level fields
    address: "Plot 23, Adeyinka Road",
    estateType: "Estate Managed",
    amenities: ["Security", "Parking", "Water Supply", "Generator"],
    clientId: "client-1",

    // Units inside this property
    units: [
      {
        id: "unit-001",
        unitNumber: "A-1",
        floor: 1,
        bedrooms: 3,
        bathrooms: 3,
        size: "145 sqm",
        rent: 2800000,
        caution: 500000,
        status: "occupied", // available | reserved | occupied | maintenance
        tenantId: "tenant-001",
        leaseStart: "2025-02-01",
        leaseEnd: "2026-02-01",
        lastInspection: "2025-01-28",
        notes: "Tenant requested smart lock installation.",
      },

      {
        id: "unit-002",
        unitNumber: "A-2",
        floor: 1,
        bedrooms: 3,
        bathrooms: 3,
        size: "145 sqm",
        rent: 2750000,
        caution: 500000,
        status: "available",
        tenantId: null,
        leaseStart: null,
        leaseEnd: null,
        lastInspection: "2025-01-20",
        notes: "Freshly painted, ready for move-in.",
      },

      {
        id: "unit-003",
        unitNumber: "B-1",
        floor: 2,
        bedrooms: 3,
        bathrooms: 3,
        size: "150 sqm",
        rent: 2900000,
        caution: 600000,
        status: "reserved",
        tenantId: "tenant-003",
        leaseStart: "2025-03-01",
        leaseEnd: "2026-03-01",
        lastInspection: "2025-02-14",
        notes: "Reserved — awaiting payment confirmation.",
      },
      {
        id: "u-101",
        number: "Unit 1",
        type: "3 Bedroom Apartment",
        bedrooms: 3,
        status: "occupied",
        tenant: "John Doe",
        rent: 450000,
        revenue: 450000,
        dueDate: "2024-05-15"
      },
      {
        id: "u-102",
        number: "Unit 2",
        type: "3 Bedroom Apartment",
        bedrooms: 2,
        status: "occupied",
        tenant: "Jane Smith",
        rent: 450000,
        revenue: 450000,
        dueDate: "2024-06-01"
      },
      {
        id: "u-103",
        number: "Unit 3",
        type: "3 Bedroom Apartment",
        bedrooms: 1,
        status: "occupied",
        tenant: "Robert Brown",
        rent: 450000,
        revenue: 450000,
        dueDate: "2024-04-20"
      },
      {
        id: "u-104",
        number: "Unit 4",
        type: "3 Bedroom Apartment",
        bedrooms: 4,
        status: "vacant",
        rent: 450000,
        revenue: 0,
        dueDate: "-"
      }

    ],
  },

  // property 2
  {
    id: "prop-002",
    title: "Modern 2-Bed Duplex",
    state: "Lagos",
    area: "Victoria Island",
    location: "Oniru",
    type: "Duplex",
    bedrooms: 2,
    bathrooms: 2,
    rent: 1800000,
    status: "Draft",
    tag: "Non-estate",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",

    address: "12 Adeola Odeku Street",
    estateType: "Non Estate",
    amenities: ["Parking", "Security", "Water Supply"],
    clientId: "client-2",

    units: [
      {
        id: "unit-101",
        unitNumber: "D-1",
        floor: 0,
        bedrooms: 2,
        bathrooms: 2,
        size: "110 sqm",
        rent: 1800000,
        caution: 400000,
        status: "available",
        tenantId: null,
        leaseStart: null,
        leaseEnd: null,
        lastInspection: null,
        notes: "Brand new listing (Draft).",
      },

      {
        id: "u-201",
        number: "Unit A",
        type: "Duplex",
        bedrooms: 2,
        status: "occupied",
        tenant: "Alice Williams",
        rent: 1200000,
        revenue: 1200000,
        dueDate: "2024-08-10"
      },
      {
        id: "u-202",
        number: "Unit B",
        type: "Duplex",
        bedrooms: 3,
        status: "occupied",
        tenant: "Michael Scott",
        rent: 1200000,
        revenue: 1200000,
        dueDate: "2024-09-12"
      },
      {
        id: "unit-102",
        unitNumber: "D-2",
        floor: 0,
        bedrooms: 2,
        bathrooms: 2,
        size: "115 sqm",
        rent: 1900000,
        caution: 450000,
        status: "occupied",
        tenantId: 'tenant-002',
        leaseStart: '2025-02-01',
        leaseEnd: '2026-02-01',
        lastInspection: '2025-01-28',
        notes: "Corner unit with better lighting.",
      },
    ],
  },
];


const defaultLocations = {
  states: ['Lagos', 'Delta'],
  areas: {
    Lagos: ['Lagos Island', 'Lagos Mainland'],
    Delta: ['Delta North', 'Delta Central', 'Delta South']
  },
  locations: {
    'Lagos Island': [
      'Ikoyi',
      'Victoria Island',
      'Lekki Phase 1',
      'Lekki Phase 2',
      'Lekki Peninsula',
      'Lekki Scheme II',
      'Chevron Drive',
      'Jakande',
      'Agungi',
      'Osapa London',
      'VGC',
      'Ajah',
      'Sangotedo',
      'Abraham Adesanya',
      'Awoyaya',
      'Lakowe',
      'Abijo GRA',
      'Badore',
      'Ilasan',
      'Maroko',
      'Banana Island',
      'Parkview Estate',
      'Old Ikoyi',
      'Dolphin Estate',
      'Bourdillon',
      'Oniru',
      'Eko Atlantic',
      'Admiralty Way',
      'Osborne Foreshore',
      'Freedom Way',
      'Akin Adesola',
      'Kofo Abayomi',
      'Ligali Ayorinde'
    ],
    'Lagos Mainland': [
      'Ikeja',
      'Yaba',
      'Surulere',
      'Maryland',
      'Ogba',
      'Gbagada',
      'Festac',
      'Ojodu',
      'Magodo',
      'Ketu',
      'Mende',
      'Anthony',
      'Ilupeju',
      'Palmgrove',
      'Bariga',
      'Shomolu',
      'Alagomeji',
      'Sabo Yaba',
      'Ebute Metta',
      'Ojuelegba',
      'Lawanson',
      'Bode Thomas',
      'Adeniran Ogunsanya',
      'Apapa',
      'Amuwo Odofin',
      'Satellite Town',
      'Alakuko',
      'Agege',
      'Iyana Ipaja',
      'Egbeda',
      'Abule Egba',
      'Isolo',
      'Okota',
      'Ajao Estate',
      'Mushin'
    ],
    'Delta North': [
      'Asaba',
      'Ibusa',
      'Okpanam',
      'Agbor',
      'Umunede',
      'Owa',
      'Issele-Uku',
      'Ogwashi-Uku',
      'Onicha-Ugbo',
      'Idumuje-Ugboko'
    ],
    'Delta Central': [
      'Warri',
      'Effurun',
      'Sapele',
      'Ughelli',
      'Udu',
      'Osubi',
      'Abraka',
      'Mosogar',
      'Jesse',
      'Orerokpe'
    ],
    'Delta South': [
      'Oleh',
      'Ozoro',
      'Burutu',
      'Koko',
      'Bomadi',
      'Patani',
      'Kwale',
      'Aboh',
      'Ogwashi',
      'Tsekelewu'
    ]
  },
  propertyTypes: ['Apartment', 'Duplex', 'Terrace', 'Studio'],
  amenities: ['WiFi', 'Parking', 'Security', 'Generator', 'Water', 'AC'],
  priceRanges: ['Under 1M', '1M - 3M', '3M - 5M', '5M+']
};

const defaultPolicies = {
  requiredDocs: `Government Issued ID\nProof of Income\nReference Letters (optional)`,
  verificationProcess: 'We verify documents on-site during inspection. Originals are required and returned immediately.',
  terms: 'Arrive on time. Bring valid ID. Maximum inspection time is 30 minutes.',
  maintenance: 'Maintenance requests are triaged by urgency. Emergencies are addressed immediately.'
};

const defaultApplications = [
  {
    id: 'app-001',
    applicant: 'John Doe',
    applicantId: 'tenant-001',

    propertyId: 'prop-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    unitId: 'unit-001A',
    unitNumber: 'A1',

    submittedAt: '2025-01-18T10:00:00Z',
    status: 'Submitted',

    slaHours: 24,
    hoursLeft: 20,

    rent: 2800000,
    leaseStart: '2025-02-01',
    leaseDurationMonths: 12,

    priority: 'Medium',
    assignedTo: 'admin-001',
    notes: ''
  },
  {
    id: 'app-002',
    applicant: 'Jane Doe',
    applicantId: 'tenant-002',

    propertyId: 'prop-002',
    propertyTitle: 'Modern 2-Bed Duplex',
    unitId: 'unit-002B',
    unitNumber: 'B2',

    submittedAt: '2025-01-18T10:00:00Z',
    status: 'Under Review',

    slaHours: 24,
    hoursLeft: 10,

    rent: 1800000,
    leaseStart: '2025-02-01',
    leaseDurationMonths: 12,

    priority: 'High',
    assignedTo: 'admin-001',
    notes: 'Requested early move-in.'
  },
  {
    id: 'app-003',
    applicant: 'Janet Emma',
    applicantId: 'tenant-003',

    propertyId: 'prop-003',
    propertyTitle: 'Modern 13-Room Mansion',
    unitId: 'unit-003A',
    unitNumber: 'A1',

    submittedAt: '2025-01-18T10:00:00Z',
    status: 'Under Review',

    slaHours: 24,
    hoursLeft: 12,

    rent: 12500000,
    leaseStart: '2025-02-01',
    leaseDurationMonths: 12,

    priority: 'High',
    assignedTo: 'admin-002',
    notes: 'High-value client. Needs fast processing.'
  }
];

const defaultInspections = [
  {
    id: 'insp-001',
    tenant: 'Jane Smith',
    propertyId: 'prop-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    unitNumber: 'A-1',
    date: '2025-01-25',
    time: '10:00 AM',
    status: 'Verified',
    type: 'Physical'
  },
  {
    id: 'insp-002',
    tenant: 'Tunde Balogun',
    propertyId: 'prop-002',
    propertyTitle: 'Modern 2-Bed Duplex',
    unitNumber: 'D-2',
    date: '2025-02-15',
    time: '02:30 PM',
    status: 'Scheduled',
    type: 'Physical'
  },
  {
    id: 'insp-003',
    tenant: 'Chioma Okeke',
    propertyId: 'prop-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    unitNumber: 'B-1',
    date: '2025-02-16',
    time: '11:00 AM',
    status: 'Scheduled',
    type: 'Virtual'
  },
  {
    id: 'insp-004',
    tenant: 'Amaka Eze',
    propertyId: 'prop-002',
    propertyTitle: 'Modern 2-Bed Duplex',
    unitNumber: 'D-1',
    date: '2025-02-10',
    time: '04:00 PM',
    status: 'No-show',
    type: 'Physical'
  }
];

const defaultSlots = [
  {
    propertyId: 'prop-001',
    date: '2025-01-25',
    times: ['10:00 AM', '12:00 PM', '4:00 PM']
  }
];

const defaultTenants = [
  {
    id: 'tenant-001',
    name: 'Jane Smith',
    email: 'janesmith@gmail.com',
    phone: '+234 812 345 6789',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    occupation: 'Creative Director',
    propertyId: 'prop-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    unitId: 'unit-001',
    unitNumber: 'A-1',
    rent: 2800000,
    leaseStart: '2025-02-01',
    leaseEnd: '2026-02-01',
    status: 'Move-in pending',
    paymentStatus: 'Paid',
    emergencyContact: {
      name: 'Michael Smith',
      phone: '+234 802 000 1122',
      relationship: 'Brother'
    },
    billingHistory: [
      { id: 'PAY-001', date: '2025-02-01', amount: 2800000, type: 'Rent', status: 'Paid' }
    ]
  },
  {
    id: 'tenant-002',
    name: 'Tunde Balogun',
    email: 'tunde.balogun@example.com',
    phone: '+234 803 777 8899',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    occupation: 'Software Architect',
    propertyId: 'prop-002',
    propertyTitle: 'Modern 2-Bed Duplex',
    unitId: 'unit-102',
    unitNumber: 'D-2',
    rent: 1900000,
    leaseStart: '2025-02-01',
    leaseEnd: '2026-02-01',
    status: 'Active',
    paymentStatus: 'Paid',
    emergencyContact: {
      name: 'Sarah Balogun',
      phone: '+234 809 333 4455',
      relationship: 'Spouse'
    },
    billingHistory: [
      { id: 'PAY-002', date: '2025-02-01', amount: 1900000, type: 'Rent', status: 'Paid' }
    ]
  },
  {
    id: 'tenant-003',
    name: 'Chioma Okeke',
    email: 'chioma.okeke@example.com',
    phone: '+234 814 222 3344',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop',
    occupation: 'Senior Accountant',
    propertyId: 'prop-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    unitId: 'unit-003',
    unitNumber: 'B-1',
    rent: 2900000,
    leaseStart: '2025-03-01',
    leaseEnd: '2026-03-01',
    status: 'Reserved',
    paymentStatus: 'Pending',
    emergencyContact: {
      name: 'John Okeke',
      phone: '+234 810 555 6677',
      relationship: 'Father'
    },
    billingHistory: [
      { id: 'PAY-003', date: '2025-03-01', amount: 600000, type: 'Service Fee', status: 'Pending' }
    ]
  }
];

// added recent activities data
const defaultRecentActivities = [
  {
    id: 'act001',
    title: 'Application Approved',
    details: 'Chioma Okeke application for 3 Bedroom Luxury Apartment has been approved.',
    time: '2 hours ago',
    status: 'approved'
  },
  {
    id: 'act002',
    title: 'Inspection Verified',
    details: 'Inspection for Modern 2-Bed Duplex has been verified by the agent.',
    time: '3 hours ago',
    status: 'verified'
  },
  {
    id: 'act003',
    title: 'Maintenance Completed',
    details: 'Plumbing repair at Ocean View Apartment has been completed.',
    time: '5 hours ago',
    status: 'completed'
  },
  {
    id: 'act004',
    title: 'Inspection In Progress',
    details: 'Inspection for Lekki Studio Apartment is currently ongoing.',
    time: '1 hour ago',
    status: 'in progress'
  },
  {
    id: 'act005',
    title: 'New Application Received',
    details: 'Tunde Balogun submitted a new application for 2 Bedroom Flat in Yaba.',
    time: '20 minutes ago',
    status: 'new'
  },
  {
    id: 'act006',
    title: 'Payment Pending',
    details: 'Rent payment for Banana Island Penthouse is awaiting confirmation.',
    time: '4 hours ago',
    status: 'pending'
  }
];

const defaultMaintenanceRequests = [
  {
    id: 'MNT-001',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Plumbing',
    propertyId: 'prop-001',
    propertyTitle: 'DomiHive Residences',
    unitNumber: 'A-102',
    tenant: 'Chioma Okeke',
    createdAt: '2 hours ago',
    description: 'Leaking pipe in the kitchen causing flooding.',
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    ]
  },
  {
    id: 'MNT-006',
    priority: 'Low',
    status: 'Open',
    category: 'Plumbing',
    propertyId: 'prop-001',
    propertyTitle: 'DomiHive Residences',
    unitNumber: 'A-102',
    tenant: 'Bartholomew',
    createdAt: '2 hours ago',
    description: 'The AC in the master bedroom is not cooling.',
    photos: []
  },
  {
    id: 'MNT-002',
    priority: 'High',
    status: 'Open',
    category: 'Electrical',
    propertyId: 'prop-002',
    propertyTitle: 'Lagos Heights',
    unitNumber: 'B-205',
    tenant: 'Emeka Okonkwo',
    createdAt: '4 hours ago',
    description: 'Multiple power outlets in the living room are not working.',
    photos: []
  },
  {
    id: 'MNT-003',
    priority: 'Medium',
    status: 'Completed',
    category: 'HVAC',
    propertyId: 'prop-003',
    propertyTitle: 'Victoria Garden',
    unitNumber: 'C-301',
    tenant: 'Tunde Adebayo',
    createdAt: '1 day ago',
    description: 'Air conditioning unit needs regular servicing.',
    photos: []
  },
  {
    id: 'MNT-004',
    priority: 'Low',
    status: 'In Progress',
    category: 'Painting',
    propertyId: 'prop-001',
    propertyTitle: 'DomiHive Residences',
    unitNumber: 'A-201',
    tenant: 'Amaka Eze',
    createdAt: '3 days ago',
    description: 'Touch up painting required in the hallway.',
    photos: []
  }
];

const defaultClients = [
  {
    id: 'client-001',
    name: 'Mrs. Adunni Lagos',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    email: 'adunni.lagos@email.com',
    phone: '+234 801 234 5678',
    clientSince: 'Jan 2026',
    location: 'Lagos, Nigeria',
    description: 'Full management client with active properties',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    totalProperties: 8,
    occupiedUnits: 6,
    occupancyPct: 75,
    contractStatus: 'Active',
    managementFeePercent: 10,
    managementFeeValue: '₦48k/month avg',
    contractType: 'Full Management',
    contractDuration: '5 years (Jan 2026 - Dec 2030)',
    maintenanceWallet: '₦50,000 annually',
    rentIncrement: 'Every 3 years',
    nextIncrement: 'Jan 2029'
  },
  {
    id: 'client-002',
    name: 'Chief Emeka Okonkwo',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    email: 'emeka.okonkwo@email.com',
    phone: '+234 802 345 6789',
    clientSince: 'Dec 2025',
    location: 'Lagos, Nigeria',
    description: 'Full management client with active properties',
    bankName: 'Access Bank',
    accountNumber: '2233445566',
    totalProperties: 5,
    occupiedUnits: 5,
    occupancyPct: 100,
    contractStatus: 'Active',
    managementFeePercent: 12,
    managementFeeValue: '₦72k/month avg',
    contractType: 'Full Management',
    contractDuration: '5 years (Jan 2026 - Dec 2030)',
    maintenanceWallet: '₦50,000 annually',
    rentIncrement: 'Every 3 years',
    nextIncrement: 'Jan 2029'
  },
  {
    id: 'client-003',
    name: 'Dr. Fatima Abdullahi',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    email: 'fatima.abdullahi@email.com',
    phone: '+234 803 456 7890',
    clientSince: 'Nov 2025',
    location: 'Lagos, Nigeria',
    description: 'Full management client with active properties',
    bankName: 'Zenith Bank',
    accountNumber: '3344556677',
    totalProperties: 12,
    occupiedUnits: 9,
    occupancyPct: 75,
    contractStatus: 'Active',
    managementFeePercent: 8,
    managementFeeValue: '₦54k/month avg',
    contractType: 'Full Management',
    contractDuration: '5 years (Jan 2026 - Dec 2030)',
    maintenanceWallet: '₦50,000 annually',
    rentIncrement: 'Every 3 years',
    nextIncrement: 'Jan 2029'
  },
  {
    id: 'client-004',
    name: 'Mr. Tunde Adebayo',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    email: 'tunde.adebayo@email.com',
    phone: '+234 804 567 8901',
    clientSince: 'Oct 2025',
    totalProperties: 3,
    occupiedUnits: 2,
    occupancyPct: 67,
    contractStatus: 'Expires Soon',
    managementFeePercent: 15,
    managementFeeValue: '₦36k/month avg'
  },
  {
    id: 'client-005',
    name: 'Mrs. Chioma Okeke',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    email: 'chioma.okeke@email.com',
    phone: '+234 805 678 9012',
    clientSince: 'Sep 2025',
    totalProperties: 6,
    occupiedUnits: 4,
    occupancyPct: 67,
    contractStatus: 'Active',
    managementFeePercent: 12,
    managementFeeValue: '₦42k/month avg'
  },
  {
    id: 'client-006',
    name: 'Engr. Bola Adesanya',
    avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
    email: 'bola.adesanya@email.com',
    phone: '+234 806 789 0123',
    clientSince: 'Aug 2025',
    totalProperties: 4,
    occupiedUnits: 3,
    occupancyPct: 75,
    contractStatus: 'Expired',
    managementFeePercent: 10,
    managementFeeValue: '₦38k/month avg'
  },
  {
    id: 'client-007',
    name: 'Mr. Ahmed Ibrahim',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    email: 'ahmed.ibrahim@email.com',
    phone: '+234 807 890 1234',
    clientSince: 'Jul 2025',
    totalProperties: 7,
    occupiedUnits: 5,
    occupancyPct: 71,
    contractStatus: 'Active',
    managementFeePercent: 9,
    managementFeeValue: '₦51k/month avg'
  },
  {
    id: 'client-008',
    name: 'Mrs. Grace Nnenna',
    avatar: 'https://randomuser.me/api/portraits/women/53.jpg',
    email: 'grace.nnenna@email.com',
    phone: '+234 808 901 2345',
    clientSince: 'Jun 2025',
    totalProperties: 9,
    occupiedUnits: 8,
    occupancyPct: 89,
    contractStatus: 'Active',
    managementFeePercent: 11,
    managementFeeValue: '₦68k/month avg'
  },
  {
    id: 'client-009',
    name: 'Dr. Kemi Adeyemi',
    avatar: 'https://randomuser.me/api/portraits/women/74.jpg',
    email: 'kemi.adeyemi@email.com',
    phone: '+234 809 012 3456',
    clientSince: 'May 2025',
    totalProperties: 2,
    occupiedUnits: 1,
    occupancyPct: 50,
    contractStatus: 'Active',
    managementFeePercent: 13,
    managementFeeValue: '₦26k/month avg'
  },
  {
    id: 'client-010',
    name: 'Mr. David Okafor',
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
    email: 'david.okafor@email.com',
    phone: '+234 810 123 4567',
    clientSince: 'Apr 2025',
    totalProperties: 15,
    occupiedUnits: 12,
    occupancyPct: 80,
    contractStatus: 'Active',
    managementFeePercent: 10,
    managementFeeValue: '₦84k/month avg'
  },
  {
    id: 'client-011',
    name: 'Mrs. Blessing Nwankwo',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    email: 'blessing.nwankwo@email.com',
    phone: '+234 811 234 5678',
    clientSince: 'Mar 2025',
    totalProperties: 6,
    occupiedUnits: 5,
    occupancyPct: 83,
    contractStatus: 'Expires Soon',
    managementFeePercent: 12,
    managementFeeValue: '₦45k/month avg'
  },
  {
    id: 'client-012',
    name: 'Prof. Samuel Ogundipe',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    email: 'samuel.ogundipe@email.com',
    phone: '+234 812 345 6789',
    clientSince: 'Feb 2025',
    totalProperties: 10,
    occupiedUnits: 7,
    occupancyPct: 70,
    contractStatus: 'Active',
    managementFeePercent: 9,
    managementFeeValue: '₦58k/month avg'
  }
];

const defaultPayments = [
  {
    id: 'PAY-001',
    tenant: 'Jane Smith',
    tenantId: 'tenant-001',
    propertyTitle: '3 Bedroom Luxury Apartment',
    propertyId: 'prop-001',
    amount: 2800000,
    status: 'Paid',
    date: '2025-02-01',
    type: 'Rent',
    paymentMethod: 'Bank Transfer',
    reference: 'REF-832910',
    invoiceId: 'INV-2025-001'
  },
  {
    id: 'PAY-002',
    tenant: 'Tunde Balogun',
    tenantId: 'tenant-002',
    propertyTitle: 'Modern 2-Bed Duplex',
    propertyId: 'prop-002',
    amount: 1900000,
    status: 'Paid',
    date: '2025-02-01',
    type: 'Rent',
    paymentMethod: 'Card',
    reference: 'REF-112233',
    invoiceId: 'INV-2025-002'
  },
  {
    id: 'PAY-003',
    tenant: 'Chioma Okeke',
    tenantId: 'tenant-003',
    propertyTitle: '3 Bedroom Luxury Apartment',
    propertyId: 'prop-001',
    amount: 600000,
    status: 'Pending',
    date: '2025-03-01',
    type: 'Service Fee',
    paymentMethod: 'Pending Transfer',
    reference: 'REF-998877',
    invoiceId: 'INV-2025-003'
  },
  {
    id: 'PAY-004',
    tenant: 'Amaka Eze',
    tenantId: 'tenant-004',
    propertyTitle: 'Modern 2-Bed Duplex',
    propertyId: 'prop-002',
    amount: 1800000,
    status: 'Overdue',
    date: '2025-01-15',
    type: 'Rent',
    paymentMethod: 'None',
    reference: '-',
    invoiceId: 'INV-2024-150'
  }
];

const isBrokenLocalUrl = (value) => {
  const url = String(value || '').trim().toLowerCase();
  return url.startsWith('blob:') || url.startsWith('file:');
};

const sanitizeMediaUrl = (value, fallback = '') => {
  if (!value || isBrokenLocalUrl(value)) return fallback;
  return value;
};

const sanitizeProperties = (list = []) =>
  (Array.isArray(list) ? list : []).map((property) => {
    const propertyImages = Array.isArray(property?.images)
      ? property.images.map((img) => sanitizeMediaUrl(img)).filter(Boolean)
      : [];
    const safePrimaryImage =
      sanitizeMediaUrl(property?.image) ||
      propertyImages[0] ||
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&h=800&fit=crop';

    const units = Array.isArray(property?.units)
      ? property.units.map((unit) => {
          const unitImages = Array.isArray(unit?.images)
            ? unit.images.map((img) => sanitizeMediaUrl(img)).filter(Boolean)
            : [];
          return {
            ...unit,
            images: unitImages
          };
        })
      : [];

    return {
      ...property,
      image: safePrimaryImage,
      images: propertyImages,
      units
    };
  });

const sanitizeClients = (list = []) =>
  (Array.isArray(list) ? list : []).map((client) => ({
    ...client,
    avatar:
      sanitizeMediaUrl(client?.avatar) ||
      'https://randomuser.me/api/portraits/lego/1.jpg'
  }));

export const AdminProvider = ({ children }) => {
  const persisted = useMemo(() => readAdminStorage(), []);
  const [properties, setProperties] = useState(() => sanitizeProperties(persisted?.properties || []));
  const [clients, setClients] = useState(() => sanitizeClients(persisted?.clients || []));
  const [locations, setLocations] = useState(() => persisted?.locations || defaultLocations);
  const [slots, setSlots] = useState(() => persisted?.slots || defaultSlots);
  const [inspections, setInspections] = useState(() => persisted?.inspections || []);
  const [applications, setApplications] = useState(() => persisted?.applications || []);
  const [tenants, setTenants] = useState(() => persisted?.tenants || []);
  const [policies, setPolicies] = useState(() => persisted?.policies || defaultPolicies);
  const [recentActivities, setRecentActivities] = useState(() => persisted?.recentActivities || []);
  const [maintenanceRequests, setMaintenanceRequests] = useState(() => persisted?.maintenanceRequests || []);
  const [payments, setPayments] = useState(() => persisted?.payments || []);

  const readInboxApplications = () => {
    try {
      const raw = localStorage.getItem(ADMIN_APPLICATION_INBOX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  };

  const mergeApplications = (baseApplications = []) => {
    const inboxApplications = readInboxApplications();
    if (!inboxApplications.length) return baseApplications;
    const merged = [...inboxApplications, ...baseApplications].filter(
      (item, index, arr) => arr.findIndex((x) => x?.id === item?.id) === index
    );
    return merged;
  };

  useEffect(() => {
    writeAdminStorage({
      properties,
      clients,
      locations,
      slots,
      inspections,
      applications,
      tenants,
      policies,
      recentActivities,
      maintenanceRequests,
      payments
    });
  }, [
    properties,
    clients,
    locations,
    slots,
    inspections,
    applications,
    tenants,
    policies,
    recentActivities,
    maintenanceRequests,
    payments
  ]);

  // Keep admin pages in sync when tenant-side flow writes to shared admin storage.
  useEffect(() => {
    const syncFromStorage = (event) => {
      if (
        event?.key &&
        event.key !== ADMIN_STORAGE_KEY &&
        event.key !== ADMIN_STORAGE_BACKUP_KEY
      ) {
        return;
      }
      const latest = readAdminStorage();
      if (!latest) return;
      if (Array.isArray(latest.properties)) setProperties(sanitizeProperties(latest.properties));
      if (Array.isArray(latest.clients)) setClients(sanitizeClients(latest.clients));
      if (latest.locations) setLocations(latest.locations);
      if (Array.isArray(latest.slots)) setSlots(latest.slots);
      if (Array.isArray(latest.inspections)) setInspections(latest.inspections);
      if (Array.isArray(latest.applications)) {
        const nextApplications = mergeApplications(latest.applications);
        setApplications(nextApplications);
      }
      if (Array.isArray(latest.tenants)) setTenants(latest.tenants);
      if (latest.policies) setPolicies(latest.policies);
      if (Array.isArray(latest.recentActivities)) setRecentActivities(latest.recentActivities);
      if (Array.isArray(latest.maintenanceRequests)) setMaintenanceRequests(latest.maintenanceRequests);
      if (Array.isArray(latest.payments)) setPayments(latest.payments);
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('domihive:admin-application-submitted', syncFromStorage);

    // Initial same-tab hydration for any queued inbox writes.
    syncFromStorage();

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('domihive:admin-application-submitted', syncFromStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      properties,
      setProperties,
      clients,
      setClients,
      locations,
      setLocations,
      slots,
      setSlots,
      inspections,
      setInspections,
      applications,
      setApplications,
      tenants,
      setTenants,
      policies,
      setPolicies,
      recentActivities,
      setRecentActivities,
      maintenanceRequests,
      setMaintenanceRequests,
      payments,
      setPayments
    }),
    [properties, clients, locations, slots, inspections, applications, tenants, policies, recentActivities, maintenanceRequests, payments]
  );


  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);
