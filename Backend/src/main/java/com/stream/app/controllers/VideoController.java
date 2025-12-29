package com.stream.app.controllers;

import com.stream.app.AppConstants;
import com.stream.app.entities.Video;
import com.stream.app.services.VideoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {

    private VideoService videoService;

    @Value("${file.video.hsl}")
    private String HSL_DIR;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    // Video Upload
    @PostMapping
    public ResponseEntity<?> create(@RequestParam("file") MultipartFile file, @RequestParam("title") String title, @RequestParam("description") String description) {
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setVideoId(UUID.randomUUID().toString());

        Video savedVideo = videoService.save(video, file);

        if (savedVideo != null) {
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(java.util.Map.of(
                            "success", true,
                            "message", "Video Uploaded Successfully"
                    ));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                            "success", false,
                            "message", "Video not uploaded"
                    ));
        }
    }

    // Get All Videos
    @GetMapping
    public List<Video> getAll() {
        return videoService.getAll();
    }

    // Stream Video (Byte Range - Fallback)
    @GetMapping("/stream/range/{videoId}")
    public ResponseEntity<Resource> streamVideoRange(@PathVariable String videoId, @RequestHeader(value = "Range", required = false) String range) {
        Video video = videoService.get(videoId);
        Path path = Paths.get(video.getFilePath());
        Resource resource = new FileSystemResource(path);
        String contentType = video.getContentType();

        if (contentType == null) contentType = "application/octet-stream";

        long fileLength = path.toFile().length();

        if (range == null) {
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
        }

        long rangeStart;
        long rangeEnd;

        String[] ranges = range.replace("bytes=", "").split("-");
        rangeStart = Long.parseLong(ranges[0]);
        rangeEnd = rangeStart + AppConstants.CHUNK_SIZE - 1;

        if (rangeEnd >= fileLength) rangeEnd = fileLength - 1;

        InputStream inputStream;

        try {
            inputStream = Files.newInputStream(path);
            inputStream.skip(rangeStart);
            long contentLength = rangeEnd - rangeStart + 1;

            byte[] data = new byte[(int) contentLength];
            int read = inputStream.read(data, 0, data.length);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Range", "bytes " + rangeStart + "-" + rangeEnd + "/" + fileLength);
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("X-Content-Type-Options", "nosniff");
            headers.setContentLength(contentLength);

            return ResponseEntity
                    .status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(data));

        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Serve HLS Playlist, Segments AND THUMBNAILS
    @GetMapping("/{videoId}/{fileName}")
    public ResponseEntity<Resource> serveHlsFile(
            @PathVariable String videoId,
            @PathVariable String fileName
    ) {
        Path path = Paths.get(HSL_DIR, videoId, fileName);
        System.out.println("Serving file: " + path.toAbsolutePath());

        if (!Files.exists(path)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String contentType = "application/octet-stream";
        if (fileName.endsWith(".m3u8")) {
            contentType = "application/vnd.apple.mpegurl";
        } else if (fileName.endsWith(".ts")) {
            contentType = "video/mp2t";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            contentType = "image/jpeg"; // Serves thumbnail
        } else if (fileName.endsWith(".png")) {
            contentType = "image/png";
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }
}