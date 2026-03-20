// src/dashboards/rent/components/property-details/components/tabs/ReviewsTab/ReviewCard.jsx
import React, { useState } from 'react';

const ReviewCard = ({ review }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);

  const handleHelpful = () => {
    if (!isHelpful) {
      setHelpfulCount(helpfulCount + 1);
      setIsHelpful(true);
    }
  };

  return (
    <div className="review-card bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="review-avatar w-12 h-12 bg-[#f8fafc] rounded-full flex items-center justify-center border border-[#e2e8f0]">
            <span className="text-lg font-bold text-[#0e1f42]">
              {review.name.charAt(0)}
            </span>
          </div>
          
          {/* User Info */}
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
        
        {/* Rating */}
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
          <span className="ml-2 text-sm font-medium text-[#0e1f42]">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review Title */}
      <h5 className="text-xl font-bold text-[#0e1f42] mb-3">{review.title}</h5>

      {/* Review Content */}
      <p className="text-[#64748b] mb-4 leading-relaxed">{review.content}</p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="review-tag px-3 py-1 bg-[#f8fafc] text-[#0e1f42] text-sm rounded-lg border border-[#e2e8f0]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
        <button
          onClick={handleHelpful}
          className={`review-helpful flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
            isHelpful
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] border border-[#e2e8f0]'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${isHelpful ? 'text-green-600' : 'text-[#64748b]'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            {isHelpful ? 'Helpful ?' : 'Helpful'}
          </span>
          <span className={`text-sm ${isHelpful ? 'text-green-600' : 'text-[#64748b]'}`}>
            ({helpfulCount})
          </span>
        </button>

        {/* Report/Share */}
        <div className="flex items-center gap-4">
          <button className="review-link text-[#64748b] hover:text-[#0e1f42] text-sm transition-colors duration-300">
            Report
          </button>
          <button className="review-link text-[#64748b] hover:text-[#0e1f42] text-sm transition-colors duration-300">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
