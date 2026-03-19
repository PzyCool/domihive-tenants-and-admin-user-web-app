import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'shield-alt' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'account', label: 'Account', icon: 'user-cog' }
];

const accent = 'var(--accent-color, #9F7539)';
const primary = 'var(--primary-color, #0E1F42)';

const getJourneyStorageKeys = (userKey) => [
  `domihive_applications_state_${userKey}`,
  `domihive_dashboard_notifications_${userKey}`,
  `domihive_properties_${userKey}`,
  `domihive_favorites_${userKey}`,
  `domihive_payments_${userKey}`,
  `domihive_message_threads_${userKey}`,
  `domihive_maintenance_tickets_${userKey}`,
  'domihive_pending_booking',
  'domihive_booking_property',
  'domihive_recent_properties',
  'domihive_inspection_bookings',
  'domihive_current_booking',
  'domihive_user_favorites',
  'domihive_user_applications',
  'domihive_home_properties_cache_v1',
  'domihive_browse_cache_v1'
];

const clearJourneyStorage = (userKey) => {
  getJourneyStorageKeys(userKey).forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem('domihive_current_booking');
};

const buildPresentationSeed = (user) => {
  const now = Date.now();
  const inspectionAt = new Date(now + 24 * 60 * 60 * 1000);
  const inspectionLabel = inspectionAt.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  const submittedAtISO = new Date(now - 3 * 1000).toISOString();

  const sampleProperty = {
    id: 'PROP-DEMO-001',
    title: '3 Bedroom Luxury Apartment',
    location: 'Lekki Phase 1, Lagos',
    address: '15 Admiralty Way, Lekki Phase 1',
    price: 2800000,
    bedrooms: 3,
    bathrooms: 3,
    size: '180 sqm',
    rating: 4.8,
    reviewCount: 24,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80'
    ],
    videos: [
      {
        id: 'walkthrough-demo-1',
        type: 'walkthrough',
        title: 'Property Walkthrough',
        description: 'Full tour of the apartment from exterior to interior',
        url: '',
        thumbnail: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
      }
    ],
    reviews: [
      {
        id: 'review-demo-1',
        name: 'Verified Tenant',
        rating: 5,
        title: 'Great apartment',
        content: 'Smooth move-in process and responsive property management.',
        verified: true,
        date: 'March 15, 2026',
        tags: ['Great Location', 'Responsive Management']
      }
    ]
  };

  const seededApplication = {
    id: `APP-DEMO-${String(now).slice(-6)}`,
    status: 'UNDER_REVIEW',
    applicantName: user?.name || 'Tenant',
    inspectionDate: inspectionLabel,
    inspectionDateISO: inspectionAt.toISOString(),
    inspectionUnlockAtISO: new Date(now - 1000).toISOString(),
    attendees: 1,
    bookingId: `DOMI-INSP-${now}`,
    bookingDateISO: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAtISO,
    createdAtISO: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAtISO: submittedAtISO,
    updatedAt: 'Just now',
    property: sampleProperty
  };

  const seededNotifications = [
    {
      id: `notif-demo-${now}`,
      createdAt: new Date(now - 4000).toISOString(),
      read: false,
      type: 'application',
      title: 'Application Submitted',
      message: 'Your application is now under review (72 hours SLA).',
      cta: { label: 'Track Application', path: `/dashboard/rent/applications/${seededApplication.id}/track` }
    },
    {
      id: `notif-demo-${now + 1}`,
      createdAt: new Date(now - 10000).toISOString(),
      read: false,
      type: 'inspection',
      title: 'Inspection Verified',
      message: `${sampleProperty.title} inspection has been verified.`,
      cta: { label: 'View Application', path: '/dashboard/rent/applications' }
    }
  ];

  return { sampleProperty, seededApplication, seededNotifications };
};

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: 'NG +234'
  });
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: ''
  });
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('domihive_theme') || 'light');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePhoto || '');
  const [isJourneyActionRunning, setIsJourneyActionRunning] = useState(false);
  const fileInputRef = useRef(null);

  const themeMap = {
    light: {
      '--primary-color': '#0E1F42',
      '--accent-color': '#9F7539',
      '--accent-light': '#b58a4a',
      '--page-bg': '#f8f9fa',
      '--card-bg': '#ffffff',
      '--text-color': '#0e1f42',
      '--text-muted': '#6c757d'
    },
    'dark-gray': {
      '--primary-color': '#0E1F42',
      '--accent-color': '#9F7539',
      '--accent-light': '#b58a4a',
      '--page-bg': '#111827',
      '--card-bg': '#1f2937',
      '--text-color': '#e5e7eb',
      '--text-muted': '#cbd5e1'
    },
    'true-black': {
      '--primary-color': '#0E1F42',
      '--accent-color': '#9F7539',
      '--accent-light': '#b58a4a',
      '--page-bg': '#000000',
      '--card-bg': '#0b0b0b',
      '--text-color': '#f8fafc',
      '--text-muted': '#cbd5e1'
    }
  };

  const applyTheme = (themeId) => {
    const selected = themeMap[themeId] || themeMap.light;
    Object.entries(selected).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.setAttribute('data-theme', themeId);
    document.body?.setAttribute('data-theme', themeId);
    localStorage.setItem('domihive_theme', themeId);
  };

  // Apply theme on mount
  React.useEffect(() => {
    applyTheme(theme);
  }, []);

  // Keep avatar preview in sync with user updates
  useEffect(() => {
    setAvatarPreview(user?.profilePhoto || '');
  }, [user?.profilePhoto]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
      updateUser?.({ profilePhoto: dataUrl });
    };
    reader.readAsDataURL(file);
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    updateUser?.({ profilePhoto: null });
  };

  const handleResetJourneyData = () => {
    if (isJourneyActionRunning) return;
    setIsJourneyActionRunning(true);
    try {
      const userKey = user?.id || 'guest';
      clearJourneyStorage(userKey);
      window.alert('Journey data reset complete. The dashboard will reload.');
      window.location.reload();
    } catch (_error) {
      window.alert('Unable to reset journey data. Please try again.');
      setIsJourneyActionRunning(false);
    }
  };

  const handleSeedPresentationJourney = () => {
    if (isJourneyActionRunning) return;
    setIsJourneyActionRunning(true);
    try {
      const userKey = user?.id || 'guest';
      clearJourneyStorage(userKey);

      const { sampleProperty, seededApplication, seededNotifications } = buildPresentationSeed(user);

      localStorage.setItem(`domihive_applications_state_${userKey}`, JSON.stringify([seededApplication]));
      localStorage.setItem(`domihive_dashboard_notifications_${userKey}`, JSON.stringify(seededNotifications));
      localStorage.setItem('domihive_recent_properties', JSON.stringify([sampleProperty]));
      localStorage.setItem('domihive_booking_property', JSON.stringify(sampleProperty));
      localStorage.setItem('domihive_home_properties_cache_v1', JSON.stringify([sampleProperty]));
      localStorage.setItem(
        'domihive_browse_cache_v1',
        JSON.stringify({
          items: [sampleProperty],
          syncedAt: new Date().toISOString()
        })
      );

      window.alert('Presentation journey seeded. The dashboard will reload.');
      window.location.reload();
    } catch (_error) {
      window.alert('Unable to seed presentation journey. Please try again.');
      setIsJourneyActionRunning(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Profile Settings</h2>
        <p className="text-sm text-[var(--text-muted,#6c757d)]">Manage your personal information and profile photo</p>
      </div>

      <div className="flex items-center gap-5 md:gap-7">
        <div className="w-32 h-32 rounded-full bg-[var(--accent-color,#9F7539)] border-4 border-white shadow-md flex items-center justify-center text-4xl text-white overflow-hidden">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={user?.name || 'Profile'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=9f7539&color=fff`;
              }}
            />
          ) : (
            <span className="text-3xl font-bold">
              {(user?.name || 'User')
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-md text-white font-semibold"
              style={{ backgroundColor: accent }}
              type="button"
              onClick={handleUploadClick}
            >
              Upload Photo
            </button>
            <button
              className="px-4 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--gray,#6c757d)] font-semibold"
              type="button"
              onClick={handleRemovePhoto}
            >
              Remove
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-[var(--text-muted,#6c757d)]">Recommended: Square JPG or PNG, max 5MB</p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">Full Name</label>
          <input
            className="w-full border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[var(--gray-light,#e2e8f0)]">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">Email Address</label>
            <input
              className="w-full border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">Phone Number</label>
            <div className="flex">
              <select
                className="border border-[var(--gray-light,#e2e8f0)] rounded-l-md px-3 py-2 bg-white text-sm"
                value={profileForm.countryCode}
                onChange={(e) => setProfileForm({ ...profileForm, countryCode: e.target.value })}
              >
                <option>NG +234</option>
                <option>GH +233</option>
                <option>US +1</option>
              </select>
              <input
                className="flex-1 border-t border-b border-r border-[var(--gray-light,#e2e8f0)] rounded-r-md px-3 py-2"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="812 345 6789"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--gray,#6c757d)] font-semibold">Reset</button>
        <button className="px-4 py-2 rounded-md text-white font-semibold" style={{ backgroundColor: accent }}>Save Changes</button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Security Settings</h2>
        <p className="text-sm text-[var(--text-muted,#6c757d)]">Manage your password and account security</p>
      </div>
      <div className="border border-[var(--gray-light,#e2e8f0)] rounded-lg p-4 space-y-3 bg-[var(--card-bg,#ffffff)]">
        <h3 className="font-semibold text-[var(--text-color,#0e1f42)]">Change Password</h3>
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-color,#0e1f42)]">Current Password</label>
          <input
            type="password"
            className="w-full border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-color,#0e1f42)]">New Password</label>
          <input
            type="password"
            className="w-full border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          />
          <div className="h-1 bg-[var(--gray-light,#e2e8f0)] rounded-full"></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-color,#0e1f42)]">Confirm New Password</label>
          <input
            type="password"
            className="w-full border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded-md text-white font-semibold" style={{ backgroundColor: accent }}>Update Password</button>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Notification Preferences</h2>
        <p className="text-sm text-[var(--text-muted,#6c757d)]">Choose how and when you want to be notified</p>
      </div>
      <div className="border border-[var(--gray-light,#e2e8f0)] rounded-lg p-4 space-y-4 bg-[var(--card-bg,#ffffff)]">
        <h3 className="font-semibold text-[var(--text-color,#0e1f42)]">Notification Methods</h3>
        {[
          { key: 'push', title: 'Push Notifications', desc: 'Receive notifications in your browser' },
          { key: 'email', title: 'Email Notifications', desc: 'Receive notifications via email' },
          { key: 'sms', title: 'SMS Alerts', desc: 'Receive important alerts via SMS' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-b-0 border-[var(--gray-light,#e2e8f0)]">
            <div>
              <p className="font-semibold text-[var(--text-color,#0e1f42)]">{item.title}</p>
              <p className="text-sm text-[var(--text-muted,#6c757d)]">{item.desc}</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={notifications[item.key]}
                onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
              />
              <div
                className={`w-12 h-7 rounded-full border transition-all duration-200 flex items-center px-[3px] ${
                  notifications[item.key]
                    ? 'bg-[var(--accent-color,#9F7539)] border-[var(--accent-color,#9F7539)]'
                    : 'bg-[var(--gray-light,#e2e8f0)] border-[var(--gray-light,#e2e8f0)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Appearance</h2>
        <p className="text-sm text-[var(--text-muted,#6c757d)]">Customize how DomiHive looks and feels</p>
      </div>
      <div className="border border-[var(--gray-light,#e2e8f0)] rounded-xl p-4 md:p-6 bg-[var(--card-bg,#ffffff)]">
        <h3 className="text-xl font-semibold text-[var(--text-color,#0e1f42)] mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          {[
            { id: 'light', label: 'Light', blocks: ['#0e1f42', '#f8fafc', '#ffffff'] },
            { id: 'dark-gray', label: 'Dark Gray', blocks: ['#1f2937', '#2f3748', '#3a404c'] },
            { id: 'true-black', label: 'True Black', blocks: ['#000000', '#0b0b0b', '#151515'] }
          ].map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`flex flex-col items-center gap-3 border-2 rounded-2xl p-3 transition-all ${
                theme === themeOption.id ? 'border-[var(--accent-color,#9F7539)] shadow-md' : 'border-[var(--gray-light,#e2e8f0)]'
              }`}
            >
              <div className="w-full h-24 rounded-xl overflow-hidden border border-[var(--gray-light,#e2e8f0)] flex flex-col">
                <div className="h-8 w-full" style={{ backgroundColor: themeOption.blocks[0] }}></div>
                <div className="flex flex-1">
                  <div className="flex-1 border-r border-[var(--gray-light,#e2e8f0)]" style={{ backgroundColor: themeOption.blocks[1] }}></div>
                  <div className="flex-1" style={{ backgroundColor: themeOption.blocks[2] }}></div>
                </div>
              </div>
              <span className="text-[var(--text-color,#0e1f42)] font-semibold">{themeOption.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            className="px-5 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
            style={{ backgroundColor: accent }}
            onClick={() => applyTheme(theme)}
          >
            <i className="fas fa-check"></i>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-color,#0e1f42)]">Account Actions</h2>
        <p className="text-sm text-[var(--text-muted,#6c757d)]">Manage your account status and data</p>
      </div>

      <div className="border border-[var(--gray-light,#e2e8f0)] rounded-lg p-4 bg-[var(--card-bg,#ffffff)] flex items-center justify-between">
        <div>
          <p className="font-semibold text-[var(--text-color,#0e1f42)]">Download Account Data</p>
          <p className="text-sm text-[var(--text-muted,#6c757d)]">Get a copy of all your data in a portable format</p>
        </div>
        <button className="px-4 py-2 rounded-md text-white font-semibold" style={{ backgroundColor: accent }}>Download Data</button>
      </div>

      <div className="border border-[var(--gray-light,#e2e8f0)] rounded-lg p-4 bg-[var(--card-bg,#ffffff)] space-y-4">
        <div>
          <p className="font-semibold text-[var(--text-color,#0e1f42)]">Demo Journey Controls</p>
          <p className="text-sm text-[var(--text-muted,#6c757d)]">
            Use this for presentation mode. Reset all user journey data or seed a guided demo flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetJourneyData}
            disabled={isJourneyActionRunning}
            className="px-4 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--text-color,#0e1f42)] font-semibold disabled:opacity-60"
          >
            Reset User Journey Data
          </button>
          <button
            type="button"
            onClick={handleSeedPresentationJourney}
            disabled={isJourneyActionRunning}
            className="px-4 py-2 rounded-md text-white font-semibold disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            Seed Presentation Journey
          </button>
        </div>
      </div>

      <div className="border border-red-200 bg-[var(--card-bg,#ffffff)] rounded-lg p-4 space-y-4">
        <p className="font-semibold text-red-500">Danger Zone</p>

        <div className="border border-red-200 rounded-lg p-3 flex items-center justify-between bg-[var(--card-bg,#ffffff)]">
          <div>
            <p className="font-semibold text-[var(--text-color,#0e1f42)]">Deactivate Account</p>
            <p className="text-sm text-[var(--text-muted,#6c757d)]">Temporarily disable your account. You can reactivate it later.</p>
          </div>
          <button className="px-4 py-2 rounded-md text-white font-semibold" style={{ backgroundColor: '#f97316' }}>Deactivate</button>
        </div>

        <div className="border border-red-300 rounded-lg p-3 flex items-center justify-between bg-[var(--card-bg,#ffffff)]">
          <div>
            <p className="font-semibold text-[var(--text-color,#0e1f42)]">Delete Account Permanently</p>
            <p className="text-sm text-[var(--text-muted,#6c757d)]">Permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>
          <button
            className="px-4 py-2 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'security':
        return renderSecurity();
      case 'notifications':
        return renderNotifications();
      case 'appearance':
        return renderAppearance();
      case 'account':
        return renderAccount();
      default:
        return renderProfile();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[var(--page-bg,#f8f9fa)] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-color,#9F7539)] text-white flex items-center justify-center text-lg">
            <i className="fas fa-cog"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color,#0e1f42)]">Profile Settings</h1>
            <p className="text-base text-[var(--text-muted,#6c757d)]">Manage your personal information and profile photo</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="bg-[var(--card-bg,#ffffff)] rounded-2xl shadow-lg border border-[var(--gray-light,#e2e8f0)] p-3 space-y-2 w-full lg:w-64 shrink-0">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-[var(--accent-color,#9F7539)] text-white'
                    : 'bg-[var(--card-bg,#ffffff)] text-[var(--text-color,#0e1f42)] hover:bg-[var(--page-bg,#f8f9fa)]'
                }`}
              >
                <i className={`fas fa-${item.icon} w-4`}></i>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-[var(--card-bg,#ffffff)] rounded-2xl shadow-lg border border-[var(--gray-light,#e2e8f0)] p-5 md:p-6 min-h-[540px] flex-1 w-full">
            {renderContent()}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-[var(--card-bg,#ffffff)] rounded-lg shadow-xl w-full max-w-md p-5 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-color,#0e1f42)]">Delete</h3>
          <p className="text-sm text-[var(--text-muted,#6c757d)]">
            This action will permanently delete your account and all data. This cannot be undone.
          </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--text-muted,#6c757d)] font-semibold"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700"
                onClick={() => setShowDeleteModal(false)}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
