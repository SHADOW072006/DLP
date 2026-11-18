package com.intellidlp.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_ANALYST')")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/explain-incident")
    public ResponseEntity<Map<String, String>> explainIncident(@RequestBody ExplainIncidentRequest request) {
        String explanation = aiService.explainIncident(request.getIncidentId());
        Map<String, String> response = new LinkedHashMap<>();
        response.put("explanation", explanation);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommend-policies")
    public ResponseEntity<Map<String, String>> recommendPolicies(@RequestBody RecommendPoliciesRequest request) {
        String recommendation = aiService.recommendPolicies(request.getContext());
        Map<String, String> response = new LinkedHashMap<>();
        response.put("recommendation", recommendation);
        return ResponseEntity.ok(response);
    }
}
