import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels"; // We know this works!

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  // State to hold the qualities found (e.g., 360p, 720p)
  const [levels, setLevels] = useState([]); 
  const [currentLevel, setCurrentLevel] = useState("Auto");

  useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        html5: {
          hls: { overrideNative: true }, 
        },
        sources: [{ src: src, type: "application/x-mpegURL" }],
      });

      playerRef.current = player;

      // --- CUSTOM QUALITY LOGIC ---
      player.ready(() => {
        const qualityLevels = player.qualityLevels();

        // Listen for new quality levels (360p, 720p, 1080p)
        qualityLevels.on("addqualitylevel", (event) => {
          const level = event.qualityLevel;
          // Update state safely
          setLevels((prev) => {
            // Avoid duplicates
            if (prev.find((l) => l.height === level.height)) return prev;
            return [...prev, level].sort((a, b) => b.height - a.height); // Sort 1080p -> 360p
          });
        });
      });

    } else {
      const player = playerRef.current;
      player.src({ src: src, type: "application/x-mpegURL" });
      // Reset levels on new video in a callback
      player.ready(() => {
        setLevels([]);
        setCurrentLevel("Auto");
      });
    }
  }, [src]);

  // Cleanup
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  // Handle Dropdown Change
  const handleQualityChange = (e) => {
    const height = e.target.value; // "Auto" or "720", "1080"
    setCurrentLevel(height);

    const player = playerRef.current;
    if (!player) return;
    
    const qualityLevels = player.qualityLevels();

    if (height === "Auto") {
      // Enable ALL levels for Auto-Adaptive behavior
      for (let i = 0; i < qualityLevels.length; i++) {
        qualityLevels[i].enabled = true;
      }
    } else {
      // Disable everything, Enable ONLY the selected one
      for (let i = 0; i < qualityLevels.length; i++) {
        const level = qualityLevels[i];
        level.enabled = (level.height.toString() === height);
      }
    }
  };

  return (
    <div className="w-full relative group">
      {/* Video Player Container */}
      <div data-vjs-player>
        <div ref={videoRef} style={{ width: "100%" }} />
      </div>

      {/* CUSTOM QUALITY SELECTOR (Only shows if levels exist) */}
      {levels.length > 0 && (
        <div className="absolute top-4 right-4 z-50">
          <select 
            value={currentLevel} 
            onChange={handleQualityChange}
            className="bg-black/70 text-white text-sm border border-gray-600 rounded px-2 py-1 hover:bg-black/90 cursor-pointer outline-none"
          >
            <option value="Auto">Auto ({levels[0]?.height}p)</option>
            {levels.map((level, index) => (
              <option key={index} value={level.height}>
                {level.height}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;