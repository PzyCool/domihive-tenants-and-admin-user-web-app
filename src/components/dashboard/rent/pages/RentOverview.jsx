// src/components/dashboard/rent/pages/RentOverview.jsx
import React from 'react';
import TopOverview from '../components/overview/TopOverview';
import UnifiedActionsPanel from '../components/overview/UnifiedActionsPanel';

const RentOverview = () => {
  return (
    <div className="rent-overview-container bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      {/* Main Content Container with RentalJourneyStatus styling */}
      <div className="bg-white rounded-lg shadow-md border border-[#e2e8f0] p-6">
        {/* 1. Top Overview - Unified Container with 3 Sections */}
        <div className="mb-8">
          <TopOverview />
        </div>
        
        {/* 2. Unified Actions Panel */}
        <div>
          <UnifiedActionsPanel rentOnlyMode />
        </div>
      </div>
    </div>
  );
};

export default RentOverview;
