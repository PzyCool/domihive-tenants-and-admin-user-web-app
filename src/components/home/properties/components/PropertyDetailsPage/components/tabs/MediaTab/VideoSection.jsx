// src/components/home/properties/components/PropertyDetailsPage/components/tabs/MediaTab/VideoSection.jsx
import React, { useState, useRef, useEffect } from 'react';

const VideoSection = ({ property }) => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const videos = [
    {
      id: 1,
      title: 'Property Walkthrough',
      description: 'Full tour of the apartment from exterior to interior',
      thumbnail: 'https://images.unsplash.com/photo-1615873968403-89e068629265?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      duration: '5:30',
      type: 'walkthrough',
      uploadDate: '2 days ago'
    }
  ];

  const safeActiveIndex = Math.min(activeVideo, Math.max(videos.length - 1, 0));
  const currentVideo = videos[safeActiveIndex] || videos[0];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoSelect = (index) => {
    const safeIndex = Math.min(index, Math.max(videos.length - 1, 0));
    setActiveVideo(safeIndex);
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (activeVideo > videos.length - 1) {
      setActiveVideo(0);
    }
  }, [activeVideo, videos.length]);

  const formatDuration = (duration) => {
    return duration;
  };

  const getVideoTypeBadge = (type) => {
    const badges = {
      walkthrough: { label: 'Walkthrough', color: 'bg-[#9f7539]' },
      neighborhood: { label: 'Area', color: 'bg-blue-500' },
      amenities: { label: 'Amenities', color: 'bg-emerald-500' },
      features: { label: 'Features', color: 'bg-purple-500' },
      virtual: { label: '360°', color: 'bg-orange-500' },
      interview: { label: 'Interview', color: 'bg-pink-500' }
    };
    return badges[type] || { label: 'Video', color: 'bg-gray-500' };
  };

  return (
    <div className="video-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-[#0e1f42]">Video Tours</h3>
          <p className="text-[#64748b] mt-1">Watch detailed tours of the property and area</p>
        </div>
      </div>

      {/* Main Video Player */}
      <div className="mb-8" ref={containerRef}>
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl">
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            {isPlaying ? (
              <div className="relative w-full h-full">
                {/* Simulated Video Player */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-white/30 rounded-full flex items-center justify-center animate-pulse mx-auto mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-white/80 text-lg font-medium">Video is playing...</p>
                  </div>
                </div>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handlePlayPause}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 mx-4">
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-[#9f7539] w-1/3"></div>
                        </div>
                      </div>
                      <div className="text-white text-sm">
                        1:45 / {currentVideo?.duration || '0:00'}
                      </div>
                    </div>
                    <button
                      onClick={handleFullscreen}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                    >
                      {isFullscreen ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="text-center cursor-pointer group"
                onClick={handlePlayPause}
              >
                <div className="relative">
                  <img
                    src={currentVideo?.thumbnail}
                    alt={currentVideo?.title}
                    className="w-full max-w-2xl rounded-lg opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#9f7539] rounded-full flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-white text-lg font-medium mt-6 group-hover:text-[#9f7539] transition-colors duration-300">Click to play video tour</p>
              </div>
            )}
          </div>
          
          {/* Video Info Overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex items-start justify-between">
              <div className="text-white max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`${getVideoTypeBadge(currentVideo?.type).color} text-white text-xs px-2 py-1 rounded-full`}>
                    {getVideoTypeBadge(currentVideo?.type).label}
                  </span>
                  <span className="text-gray-300 text-sm">Uploaded {currentVideo?.uploadDate}</span>
                </div>
                <h4 className="text-2xl font-bold mb-2">{currentVideo?.title}</h4>
                <p className="text-gray-300">{currentVideo?.description}</p>
              </div>
            </div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentVideo?.duration || '0:00'}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-8 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0e1f42]">{videos.length}</div>
            <div className="text-sm text-[#64748b]">Total Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0e1f42]">24m</div>
            <div className="text-sm text-[#64748b]">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0e1f42]">HD</div>
            <div className="text-sm text-[#64748b]">Video Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0e1f42]">EN</div>
            <div className="text-sm text-[#64748b]">Audio Language</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
