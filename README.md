# 🎬 Video Streaming Platform

> A full-stack, adaptive bitrate video streaming application inspired by Netflix architecture. Built to demonstrate **HLS Streaming**, **FFmpeg Transcoding**, and **Generative AI Integration**.

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-7ACF51?style=for-the-badge&logo=react&logoColor=61DAFB)
![FFmpeg](https://img.shields.io/badge/FFmpeg-Processing-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

---

## 🎯 Project Objective

The goal of this project was to build a scalable video streaming backend that solves real-world engineering problems:
1.  **Bandwidth Efficiency:** Implementing **HLS (HTTP Live Streaming)** to allow users to switch between 360p, 720p, and 1080p based on their network speed.
2.  **Automation:** Using **Generative AI** to eliminate manual data entry for video metadata (Title and Description).
3.  **Performance:** ensuring video uploads do not block the main thread by using asynchronous processing.

---

## ✨ Key Features

### 🎥 Video Engineering & Streaming
* **Adaptive HLS Streaming:** Videos are transcoded into `.m3u8` playlists and `.ts` segments.
* **Multi-Resolution Support:** Auto-generates **360p, 720p, and 1080p** versions of every upload using **FFmpeg**.
* **Thumbnail Generation:** Automatically extracts a snapshot at the 1-second mark to serve as the video thumbnail.

### 🧠 AI-Powered Metadata (Google Gemini 2.5)
* **Smart Auto-Fill:** Users can input rough notes or a transcript, and the backend communicates with Google Gemini to generate a professional **Title** and **Description**.
* **Structured Data:** Uses prompt engineering to ensure the AI returns clean, JSON-formatted data for the UI.

### 💻 Modern Frontend
* **Custom Video Player:** Built on **Video.js** with custom UI controls for Quality Selection and Playback Speed (0.5x - 2x).
* **Responsive UI:** Dark-mode interface built with **Tailwind CSS**.

---

## 🏗️ System Architecture

1.  **Upload:** User uploads a raw video file (MP4/MKV) via the React Frontend.
2.  **Storage:** Spring Boot saves the raw file to local storage.
3.  **Processing:** An asynchronous service triggers **FFmpeg** to:
    * Take a screenshot (Thumbnail).
    * Transcode the video into HLS segments (3 qualities).
    * Create a Master Playlist (`master.m3u8`).
4.  **Database:** Metadata and file paths are stored in MySQL.
5.  **Streaming:** The Frontend requests the master playlist, and the Video.js player adaptively fetches the correct segments based on bandwidth.

---

## 🛠️ Technology Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Backend** | Java 17, Spring Boot 3 | REST API, Business Logic |
| **Database** | MySQL | Persistent Metadata Storage |
| **Media Processing** | FFmpeg | Video Transcoding, Thumbnail Extraction |
| **AI Model** | Google Gemini 2.5 Flash | Metadata Generation |
| **Frontend** | React 18, Vite | SPA User Interface |
| **Styling** | Tailwind CSS | Responsive Design |
| **Player** | Video.js | HLS Playback, Quality Control |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/videos` | Upload raw video file & trigger processing |
| **GET** | `/api/v1/videos` | Fetch all videos with metadata |
| **GET** | `/api/v1/videos/{id}/master.m3u8` | Stream the Master HLS Playlist |
| **GET** | `/api/v1/videos/{id}/thumbnail.jpg` | Fetch the generated thumbnail |
| **GET** | `/api/v1/videos/stream/range/{id}` | (Fallback) Stream raw video by byte-range |
| **POST** | `/api/v1/ai/generate-metadata` | Generate Title/Description via AI |

---

## 📸 Screenshots

### 1. AI-Powered Upload Page
*(Place your screenshot here: e.g., `![Upload](screenshots/upload.png)`)*
> Users enter rough notes, and AI generates the title and description instantly.

### 2. Video Player with Quality Selector
*(Place your screenshot here: e.g., `![Player](screenshots/player.png)`)*
> Custom player showing 1080p/720p/360p options via HLS.

### 3. Video MySQL Database
*(Place your screenshot here: e.g., `![Player](screenshots/player.png)`)*
> Custom player showing 1080p/720p/360p options via HLS.

---

## 🚀 Installation & Setup

### Prerequisites
* **Java 17+**
* **Node.js & npm**
* **MySQL**
* **FFmpeg** (Must be installed and added to System PATH)

### 1. Backend Setup
```bash
git clone [https://github.com/yourusername/project-name.git](https://github.com/yourusername/project-name.git)
cd backend
# Configure src/main/resources/application.properties with your DB and API keys
mvn spring-boot:run
