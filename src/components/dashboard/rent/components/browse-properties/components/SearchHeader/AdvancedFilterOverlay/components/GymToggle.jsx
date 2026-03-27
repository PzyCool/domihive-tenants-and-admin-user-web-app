import React from 'react';

const GymToggle = ({ enabled = false, onChange }) => {
  const handleToggle = () => {
    if (onChange) {
      onChange(!enabled);
    }
  };

  return (
    <div className="gym-toggle">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-700 flex items-center gap-2 text-sm">
          <i className="fas fa-dumbbell text-[#9f7539]"></i>
          Gym
        </p>

        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${enabled ? 'bg-[#9f7539]' : 'bg-gray-300'}
          `}
        >
          <span
            className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
          />
        </button>
      </div>

      <div className="text-xs text-gray-600">
        {enabled ? 'Gym available in this property' : 'No gym available'}
      </div>
    </div>
  );
};

export default GymToggle;
