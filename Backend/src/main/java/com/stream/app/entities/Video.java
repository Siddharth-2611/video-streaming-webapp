package com.stream.app.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "yt_videos")
public class Video {

    @Id
    private String videoId;
    private String title;
    @jakarta.persistence.Column(length = 4000) // Allows ~500-600 words
    private String description;
    private String contentType;
    private String filePath;

    // --- 1. No-Args Constructor (Required by JPA) ---
    public Video() {
    }

    // --- 2. All-Args Constructor ---
    public Video(String videoId, String title, String description, String contentType, String filePath) {
        this.videoId = videoId;
        this.title = title;
        this.description = description;
        this.contentType = contentType;
        this.filePath = filePath;
    }

    // --- 3. Manual Getters and Setters ---

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}