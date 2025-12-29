import React, { useState } from "react";
import Navbar from "./components/Navbar";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import { Toaster } from "react-hot-toast";
import "video.js/dist/video-js.css";

function App() {
  const [currentView, setCurrentView] = useState("upload");

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <Navbar activeView={currentView} setView={setCurrentView} />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-4">
        {currentView === "upload" ? (
             <VideoUpload />
        ) : (
             <VideoList />
        )}
      </div>
    </div>
  );
}

export default App;