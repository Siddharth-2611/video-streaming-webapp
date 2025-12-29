package com.stream.app.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public AiService() {
        this.restTemplate = new RestTemplate();
    }

    public String generateVideoMetadata(String transcriptText) {
        String url = apiUrl + apiKey;

        // 1. Construct the Prompt
        String prompt = String.format(
                "You are an expert video editor. Read the following transcript and generate a JSON response with 3 fields: " +
                        "'title' (catchy, max 10 words), " +
                        "'description' (summary, max 50 words), " +
                        "and 'tags' (comma separated list of 5 tags). " +
                        "Return ONLY the raw JSON string, no markdown. \n\nTranscript: %s",
                transcriptText
        );

        // 2. Create Request Body (Gemini JSON format)
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> parts = new HashMap<>();

        parts.put("text", prompt);
        content.put("parts", List.of(parts));
        requestBody.put("contents", List.of(content));

        // 3. Send Request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // 4. Extract the answer from nested JSON
            // Response structure: candidates[0].content.parts[0].text
            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");

            return (String) partsList.get(0).get("text");

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"title\": \"Error generating title\", \"description\": \"AI Service unavailable\", \"tags\": \"error\"}";
        }
    }
}