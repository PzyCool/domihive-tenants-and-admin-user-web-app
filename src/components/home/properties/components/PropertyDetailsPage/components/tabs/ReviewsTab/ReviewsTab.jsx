// src/components/home/properties/components/PropertyDetailsPage/components/tabs/ReviewsTab/ReviewsTab.jsx
import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import RatingSummary from './RatingSummary';
// import ReviewFilters from './ReviewFilters';
import ActionSection from '../../ActionSection/ActionSection';

const ReviewsTab = ({ property, listingType, onBookInspection }) => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="reviews-tab space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-2">
          Resident Reviews & Ratings
        </h3>
        <p className="text-gray-600">
          See what residents have to say
        </p>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <RatingSummary 
          rating={property.rating || 4.5}
          reviewCount={property.reviewCount || 24}
        />
      </div>

      {/* Review Filters */}
      <div>
        {/* <ReviewFilters 
          currentFilter={filter}
          onFilterChange={setFilter}
        /> */}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {property.reviews?.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
        
        {(!property.reviews || property.reviews.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <i className="fas fa-comment-alt text-gray-400 text-4xl mb-4"></i>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              No Reviews Yet
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              This property doesn't have any reviews yet.
            </p>
          </div>
        )}
      </div>

      {/* Action Section - BELOW, centered */}
      <div className="mt-8">
        <ActionSection 
          property={property}
          onBookInspection={onBookInspection}
        />
      </div>
    </div>
  );
};

export default ReviewsTab;
