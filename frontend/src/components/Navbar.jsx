import React from "react";

function Navbar({ activeView, setView }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-700 text-white shadow-md">
      {/* Brand */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("upload")}>
        <div className="bg-violet-600 p-2 rounded-lg">
          <span className="text-xl font-bold">▶</span>
        </div>
        <h1 className="text-2xl font-bold tracking-wide">StreamApp</h1>
      </div>

      {/* Nav Links */}
      <div className="flex gap-4">
        <button
          onClick={() => setView("upload")}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            activeView === "upload"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setView("watch")}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            activeView === "watch"
              ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Watch
        </button>
      </div>
    </div>
  );
}

export default Navbar;