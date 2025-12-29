package com.stream.app.services.impl;

import com.stream.app.entities.Video;
import com.stream.app.repositories.VideoRepository;
import com.stream.app.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    String DIR;

    @Value("${file.video.hsl}")
    String HSL_DIR;

    private VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @PostConstruct
    public void init() {
        File file = new File(DIR);
        try {
            Files.createDirectories(Paths.get(HSL_DIR));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if (!file.exists()) {
            file.mkdir();
            System.out.println("Folder Created:");
        } else {
            System.out.println("Folder already created");
        }
    }

    @Override
    public Video save(Video video, MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();

            String cleanFileName = StringUtils.cleanPath(filename);
            String cleanFolder = StringUtils.cleanPath(DIR);
            Path path = Paths.get(cleanFolder, cleanFileName);

            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);

            video.setContentType(contentType);
            video.setFilePath(path.toString());
            Video savedVideo = videoRepository.save(video);

            // Async video processing
            processVideo(savedVideo.getVideoId());

            return savedVideo;

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error in processing video ");
        }
    }

    @Override
    public Video get(String videoId) {
        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("video not found"));
        return video;
    }

    @Override
    public Video getByTitle(String title) {
        return null;
    }

    @Override
    public List<Video> getAll() {
        return videoRepository.findAll();
    }

    @Override
    public String processVideo(String videoId) {
        Video video = this.get(videoId);
        String filePath = video.getFilePath();
        Path videoPath = Paths.get(filePath);

        try {
            Path outputPath = Paths.get(HSL_DIR, videoId);
            Files.createDirectories(outputPath);

            // 1. GENERATE THUMBNAIL (Take snapshot at 1 second)
            String thumbnailCmd = String.format(
                    "ffmpeg -i \"%s\" -ss 00:00:01 -vframes 1 \"%s/thumbnail.jpg\"",
                    videoPath.toAbsolutePath(),
                    outputPath.toAbsolutePath()
            );

            ProcessBuilder thumbnailBuilder;
            boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");

            if (isWindows) {
                thumbnailBuilder = new ProcessBuilder("cmd.exe", "/c", thumbnailCmd);
            } else {
                thumbnailBuilder = new ProcessBuilder("/bin/bash", "-c", thumbnailCmd);
            }

            thumbnailBuilder.inheritIO();
            Process thumbnailProcess = thumbnailBuilder.start();
            thumbnailProcess.waitFor(); // Wait for thumbnail before HLS (Optional)


            // 2. GENERATE HLS SEGMENTS
            String ffmpegCmd = String.format(
                    "ffmpeg -i \"%s\" " +
                            "-map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 " +
                            "-c:v libx264 -crf 22 -c:a aac -ar 48000 " +
                            "-filter:v:0 scale=w=640:h=360  -maxrate:v:0 600k -b:a:0 64k " +
                            "-filter:v:1 scale=w=1280:h=720 -maxrate:v:1 1500k -b:a:1 128k " +
                            "-filter:v:2 scale=w=1920:h=1080 -maxrate:v:2 3000k -b:a:2 128k " +
                            "-var_stream_map \"v:0,a:0,name:360p v:1,a:1,name:720p v:2,a:2,name:1080p\" " +
                            "-preset fast -hls_list_size 0 -threads 0 -f hls " +
                            "-hls_time 10 -hls_flags independent_segments " +
                            "-master_pl_name \"master.m3u8\" " +
                            "-hls_segment_filename \"%s/segment_%%v_%%03d.ts\" \"%s/playlist_%%v.m3u8\"",
                    videoPath.toAbsolutePath(),
                    outputPath.toAbsolutePath(),
                    outputPath.toAbsolutePath()
            );

            System.out.println(ffmpegCmd);

            ProcessBuilder processBuilder;
            if (isWindows) {
                processBuilder = new ProcessBuilder("cmd.exe", "/c", ffmpegCmd);
            } else {
                processBuilder = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
            }

            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exit = process.waitFor();

            if (exit != 0) {
                throw new RuntimeException("Video processing failed with exit code " + exit);
            }

            return videoId;

        } catch (IOException | InterruptedException ex) {
            throw new RuntimeException("Video processing fail!! " + ex.getMessage());
        }
    }
}