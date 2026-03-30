// src/dashboards/rent/components/property-details/components/tabs/ReviewsTab/ReviewsTab.jsx
import React from 'react';
import ReviewCard from './ReviewCard';

const ReviewsTab = ({ property }) => {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      status: 'Verified Tenant',
      date: 'March 15, 2024',
      rating: 5,
      title: 'Perfect Home for Our Family!',
      content: "We've been living here for 2 years and it's been absolutely wonderful. The location is perfect, the neighbors are friendly, and the maintenance team is very responsive. The apartment is spacious and well-maintained.",
      tags: ['Great Location', 'Responsive Maintenance', 'Spacious Rooms'],
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      name: 'Michael Adebayo',
      status: 'Former Tenant',
      date: 'February 28, 2024',
      rating: 4,
      title: 'Good overall experience',
      content: 'The property is well maintained and the security is excellent. Only issue was occasional water pressure problems.',
      tags: ['Good Security', 'Well Maintained'],
      helpful: 8,
      verified: true
    }
  ];

  return (
    <div className="reviews-tab">
      {/* Verified Badge */}
      <div className="reviews-verified bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
        <div className="reviews-verified-row flex items-center gap-3">
          <div className="reviews-verified-icon w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="reviews-verified-title font-medium text-green-800">DomiHive Verified Reviews</h4>
            <p className="reviews-verified-text text-sm text-green-600">All reviews are from verified tenants who have lived in this property</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

    </div>
  );
};

export default ReviewsTab;
