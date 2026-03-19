import React from 'react';

const VideoSection = ({ property }) => {
  const videos = Array.isArray(property?.videos) ? property.videos : [];
  const walkthrough = videos.find((item) => item.type === 'walkthrough') || videos[0] || null;

  if (!walkthrough) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center">
        <h3 className="text-2xl font-bold text-[#0e1f42] mb-2">Video Tours</h3>
        <p className="text-sm text-[#64748b]">No walkthrough video uploaded yet.</p>
      </div>
    );
  }

  const poster = walkthrough.thumbnail || property?.images?.[0] || property?.image || '';

  return (
    <div className="video-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-[#0e1f42]">Video Tours</h3>
          <p className="text-[#64748b] mt-1">Watch the property walkthrough video</p>
        </div>
      </div>

      <div className="video-player-shell relative rounded-2xl overflow-hidden bg-black shadow-xl">
        <div className="aspect-video">
          {walkthrough.url ? (
            <video controls className="w-full h-full" poster={poster}>
              <source src={walkthrough.url} />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src={poster} alt={walkthrough.title || 'Property walkthrough'} className="w-full h-full object-cover opacity-60" />
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="text-white max-w-2xl">
            <h4 className="text-2xl font-bold mb-2">{walkthrough.title || 'Property Walkthrough'}</h4>
            {walkthrough.description && <p className="text-gray-300">{walkthrough.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
