import React, { useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function VideoUpload() {
  const fileInputRef = useRef(null);

  // Data States
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // New State for AI
  const [aiContext, setAiContext] = useState(""); 
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // UI States
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- Helper Functions ---
  const countWords = (str) => {
    return str.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAiContext(""); // Reset AI input
    setFile(null);
    setFileName("No file chosen");
    setErrors({});
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Handlers ---
  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (countWords(val) <= 15) {
      setTitle(val);
      if (errors.title) setErrors({ ...errors, title: "" });
    }
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    if (countWords(val) <= 100) {
      setDescription(val);
      if (errors.description) setErrors({ ...errors, description: "" });
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (errors.file) setErrors({ ...errors, file: "" });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // --- NEW: AI Generation Logic ---
  const handleAiGenerate = async () => {
    if (!aiContext.trim()) {
        toast.error("Please enter some context or notes first!");
        return;
    }

    setIsAiGenerating(true);
    try {
        const response = await axios.post("http://localhost:8080/api/v1/ai/generate-metadata", {
            transcript: aiContext
        });

        // Parse JSON response (Handle cases where backend returns stringified JSON)
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        setTitle(data.title || "");
        setDescription(data.description || "");
        toast.success("✨ Magic! Metadata generated.");

    } catch (error) {
        console.error(error);
        toast.error("AI Generation failed. Check backend.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  // --- Main Upload Logic ---
  const handleUpload = async () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Video title is required.";
    if (!description.trim()) newErrors.description = "Video description is required.";
    if (!file) newErrors.file = "Please upload a video file.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/videos`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      toast.success("Video uploaded successfully!");
      console.log("Server Response:", response.data);
      resetForm();

    } catch (error) {
      console.error(error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10 text-white px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-4xl rounded-xl bg-gray-900 border border-gray-700 p-8 shadow-2xl">
        
        <h2 className="text-4xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-600">
          Upload Your Video
        </h2>

        {/* --- NEW: AI Section --- */}
        <div className="mb-8 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-violet-400">
                    ✨ AI Auto-Fill (Optional)
                </label>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="Paste transcript or rough notes here (e.g. 'Tutorial on installing Java on Windows...')"
                    className="flex-1 rounded-lg bg-gray-900 border border-gray-600 p-3 text-sm text-gray-300 focus:border-violet-500 focus:outline-none"
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || uploading}
                    className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2
                        ${isAiGenerating ? "bg-gray-700 text-gray-400 cursor-wait" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg"}`}
                >
                    {isAiGenerating ? "Thinking..." : "Generate"}
                </button>
            </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video Title <span className="text-gray-500 text-xs ml-2">({countWords(title)}/15 words)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            disabled={uploading}
            placeholder="Enter video title..."
            className={`w-full rounded-lg bg-gray-800 border p-3 text-white focus:outline-none placeholder-gray-500 transition-colors
              ${errors.title ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-violet-500"}
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video Description <span className="text-gray-500 text-xs ml-2">({countWords(description)}/100 words)</span>
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            disabled={uploading}
            rows="5" 
            placeholder="Enter video description..."
            className={`w-full rounded-lg bg-gray-800 border p-3 text-white focus:outline-none resize-none placeholder-gray-500 transition-colors
              ${errors.description ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-violet-500"}
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* File Upload Area */}
        <div className={`flex items-center gap-6 mb-2 border border-dashed rounded-lg p-6 bg-gray-800/50 hover:bg-gray-800/80 transition-colors
           ${errors.file ? "border-red-500" : "border-gray-600"}
           ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
           
          <img
            src="/src/assets/upload.png" // Ensure this path is correct
            alt="Upload icon"
            className="h-14 w-14 object-contain opacity-80"
          />

          <div className="flex flex-col gap-2 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".mp4, .webm, .mkv"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handleButtonClick}
                type="button"
                className="rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 shadow-md"
              >
                Choose File
              </button>
              <span className="text-sm text-gray-300 font-medium">
                {fileName}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              MP4, WebM, or MKV (max 500MB)
            </p>
          </div>
        </div>
        
        <div className="mb-8 min-h-[20px]">
          {errors.file && <p className="text-red-400 text-sm">{errors.file}</p>}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full rounded-lg py-3.5 text-lg font-bold transition shadow-lg
            ${uploading 
              ? "bg-violet-800 cursor-not-allowed text-gray-300" 
              : "bg-pink-600 hover:bg-pink-700 text-white"}`}
        >
          {uploading ? `Uploading... ${progress}%` : "Upload Video"}
        </button>
      </div>
    </div>
  );
}

export default VideoUpload;