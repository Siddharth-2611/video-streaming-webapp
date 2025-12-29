import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer"; 
import toast from "react-hot-toast";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch videos on load
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/videos");
        setVideos(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error loading videos");
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      
      {/* --- Video Player Section --- */}
      {selectedVideo && (
        <div className="mb-12 bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl animate-fade-in">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <h2 className="text-xl font-bold text-violet-400 truncate w-3/4">
                Now Playing: <span className="text-white">{selectedVideo.title}</span>
            </h2>
            <button 
              onClick={() => setSelectedVideo(null)}
              className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition text-sm font-semibold"
            >
              Close Player ✕
            </button>
          </div>
          
          <div className="w-full bg-black flex justify-center">
            {/* The HLS URL */}
            <VideoPlayer 
              src={`http://localhost:8080/api/v1/videos/${selectedVideo.videoId}/master.m3u8`} 
            />
          </div>
          
          <div className="p-6">
             <h3 className="text-lg font-semibold mb-2">Description</h3>
             <p className="text-gray-300 leading-relaxed">{selectedVideo.description}</p>
          </div>
        </div>
      )}

      {/* --- Video Grid Section --- */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 bg-pink-500 rounded-full"></div>
        <h3 className="text-2xl font-bold">All Videos ({videos.length})</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.videoId} 
            className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-violet-500 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1"
            onClick={() => {
                setSelectedVideo(video);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {/* THUMBNAIL DISPLAY */}
            <div className="relative aspect-video bg-gray-900">
              <img 
                src={`http://localhost:8080/api/v1/videos/${video.videoId}/thumbnail.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => {
                    // Fallback for old videos without thumbnails
                    e.target.src = "https://via.placeholder.com/640x360/1f2937/ffffff?text=No+Thumbnail";
                }}
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-violet-600/90 rounded-full p-3 shadow-lg">
                    <svg className="w-8 h-8 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                 </div>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-bold text-lg mb-2 truncate text-white group-hover:text-violet-400 transition">
                {video.title}
              </h4>
              <p className="text-gray-400 text-sm line-clamp-2">
                {video.description}
              </p>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg">No videos found.</p>
            <p className="text-sm">Upload a video to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoList;