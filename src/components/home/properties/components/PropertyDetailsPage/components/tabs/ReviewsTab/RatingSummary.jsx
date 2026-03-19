import React from 'react';

const RatingSummary = ({ property }) => {
  const reviews = Array.isArray(property?.reviews) ? property.reviews : [];
  const totalReviews = Number(property?.reviewCount || reviews.length || 0);
  const averageRating = Number(property?.rating || (reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0));

  return (
    <div className="rating-summary mb-8 bg-white rounded-2xl border border-[#e2e8f0] p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-[#0e1f42] mb-2">{averageRating ? averageRating.toFixed(1) : '0.0'}</div>
          <div className="flex items-center justify-center md:justify-start mb-2">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`fas fa-star ${i < Math.round(averageRating) ? 'text-[#9f7539]' : 'text-gray-300'}`} />
            ))}
          </div>
          <div className="text-[#64748b]">
            {totalReviews > 0 ? `Based on ${totalReviews} review${totalReviews === 1 ? '' : 's'}` : 'No reviews yet'}
          </div>
        </div>

        <div className="md:col-span-2">
          {totalReviews > 0 ? (
            <p className="text-sm text-[#64748b]">Review analytics will grow as more tenants submit verified feedback.</p>
          ) : (
            <p className="text-sm text-[#64748b]">This property has not received any reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;
