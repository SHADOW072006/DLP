package com.intellidlp.ai;

import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.incident.Incident;
import com.intellidlp.incident.IncidentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
public class AiService {

    private static final String DISABLED_MSG =
            "AI analysis is disabled. Enable Ollama integration in application config.";

    @Value("${intellidlp.ai.ollama-url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${intellidlp.ai.model:llama3.2:latest}")
    private String model;

    @Value("${intellidlp.ai.enabled:true}")
    private boolean aiEnabled;

    private final IncidentRepository incidentRepository;
    private final HttpClient httpClient;

    public AiService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    public String explainIncident(UUID incidentId) {
        if (!aiEnabled) return DISABLED_MSG;

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + incidentId));

        StringBuilder context = new StringBuilder();
        context.append("Incident Code: ").append(incident.getIncidentCode()).append("\n");
        context.append("Status: ").append(incident.getStatus()).append("\n");
        context.append("Severity: ").append(incident.getSeverity()).append("\n");
        context.append("Risk Score: ").append(incident.getRiskScore()).append("\n");
        context.append("Risk Breakdown: ").append(maskSensitiveData(incident.getRiskBreakdown())).append("\n");

        if (incident.getEndpoint() != null) {
            context.append("Endpoint: [REDACTED]\n");
        }
        if (incident.getScannedFile() != null) {
            context.append("File: [REDACTED]\n");
            context.append("File Type: ").append(incident.getScannedFile().getFileType()).append("\n");
            context.append("Classification: ").append(incident.getScannedFile().getClassificationLevel()).append("\n");
        }
        if (incident.getPolicyDecision() != null && incident.getPolicyDecision().getPolicy() != null) {
            context.append("Policy: ").append(incident.getPolicyDecision().getPolicy().getName()).append("\n");
            context.append("Action Applied: ").append(incident.getPolicyDecision().getDecisionApplied()).append("\n");
            context.append("Simulation Mode: ").append(incident.getPolicyDecision().isSimulated()).append("\n");
        }

        String prompt = "You are a Data Loss Prevention analyst. Analyze this DLP incident and provide a clear " +
                "explanation of what happened, potential risks, and recommended remediation steps.\n\n" +
                "INCIDENT DETAILS:\n" + context;

        return callOllama(prompt);
    }

    public String recommendPolicies(String context) {
        if (!aiEnabled) return DISABLED_MSG;
        String prompt = "You are a Data Loss Prevention expert. Based on the following context, " +
                "recommend appropriate DLP policies to implement:\n\n" + context;
        return callOllama(prompt);
    }

    private String callOllama(String prompt) {
        try {
            String escapedModel = model.replace("\"", "\\\"");
            String escapedPrompt = prompt
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");

            String requestBody = "{\"model\":\"" + escapedModel + "\",\"prompt\":\"" + escapedPrompt + "\",\"stream\":false}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaUrl + "/api/generate"))
                    .timeout(Duration.ofSeconds(120))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            // Parse "response" field from JSON — simple extraction without extra dependencies
            int idx = body.indexOf("\"response\":");
            if (idx < 0) {
                return "AI response could not be parsed. Raw: " + body.substring(0, Math.min(200, body.length()));
            }
            int start = body.indexOf("\"", idx + 11) + 1;
            int end = findJsonStringEnd(body, start);
            if (start <= 0 || end < 0) {
                return "AI response parsing error.";
            }
            return unescapeJson(body.substring(start, end));
        } catch (IOException e) {
            return "AI service unavailable: " + e.getMessage();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "AI request interrupted.";
        }
    }

    private String maskSensitiveData(String input) {
        if (input == null) return "";
        // Replace anything that looks like a value after a colon with [REDACTED]
        return input.replaceAll(":\\s*\\S+", ": [REDACTED]");
    }

    private int findJsonStringEnd(String json, int start) {
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '\\') {
                i++; // skip escaped char
            } else if (c == '"') {
                return i;
            }
        }
        return -1;
    }

    private String unescapeJson(String s) {
        return s.replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}
