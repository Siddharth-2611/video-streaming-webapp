package com.stream.app.controllers;

import com.stream.app.services.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
// @CrossOrigin("*") <--- REMOVED TO FIX CONFLICT
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-metadata")
    public ResponseEntity<?> generateMetadata(@RequestBody Map<String, String> payload) {
        String transcript = payload.get("transcript");

        if (transcript == null || transcript.isEmpty()) {
            return ResponseEntity.badRequest().body("Transcript is required");
        }

        String aiResponse = aiService.generateVideoMetadata(transcript);
        return ResponseEntity.ok(aiResponse);
    }
}