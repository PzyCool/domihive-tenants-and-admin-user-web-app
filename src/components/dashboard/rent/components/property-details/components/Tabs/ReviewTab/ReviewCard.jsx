// src/dashboards/rent/components/property-details/components/tabs/ReviewsTab/ReviewCard.jsx
import React from 'react';

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="review-avatar w-12 h-12 bg-[#f8fafc] rounded-full flex items-center justify-center border border-[#e2e8f0]">
            <span className="text-lg font-bold text-[#0e1f42]">{review.name.charAt(0)}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#0e1f42]">{review.name}</h4>
              {review.verified && (
                <span className="review-verified px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <span>{review.status}</span>
              <span>•</span>
              <span>{review.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < review.rating ? 'text-[#9f7539]' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm font-medium text-[#0e1f42]">{review.rating}.0</span>
        </div>
      </div>

      <h5 className="text-xl font-bold text-[#0e1f42] mb-3">{review.title}</h5>
      <p className="text-[#64748b] leading-relaxed">{review.content}</p>
    </div>
  );
};

export default ReviewCard;
