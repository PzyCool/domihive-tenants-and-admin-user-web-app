// src/dashboards/rent/components/book-inspection/UserContextBanner.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';

const UserContextBanner = () => {
  const { user } = useAuth();
  const location = useLocation();

  const dashboardColors = {
    'Rent': '#3498db',
    'Short Let': '#f39c12',
    'Student': '#9b59b6',
    'Buy': '#27ae60'
  };

  const dashboardType = location.pathname.includes('/dashboard/rent') ? 'Rent' : 'Dashboard';
  const displayName =
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.email ||
    'Account User';

  const badgeColor = dashboardColors[dashboardType] || '#3498db';

  return (
    <div className="bg-gradient-to-r from-[#9f7539] to-[#b58a4a] text-white p-6 rounded-xl shadow-[0_4px_15px_rgba(159,117,57,0.3)] mb-8">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        <i className="fas fa-user-circle text-2xl opacity-90"></i>
        <div className="flex-1">
          <div className="text-sm opacity-80 mb-1">Booking as:</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{displayName}</span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              {dashboardType}
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-center gap-3 text-sm opacity-90 bg-white/10 p-3 rounded-lg border-l-2 border-white/50">
        <i className="fas fa-info-circle"></i>
        <div>
          Your account information is automatically used for this booking
        </div>
      </div>
    </div>
  );
};

export default UserContextBanner;
