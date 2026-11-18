package com.intellidlp.analytics;

import com.intellidlp.incident.IncidentDto;
import com.intellidlp.incident.IncidentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final IncidentService incidentService;

    public AnalyticsController(AnalyticsService analyticsService, IncidentService incidentService) {
        this.analyticsService = analyticsService;
        this.incidentService = incidentService;
    }

    @GetMapping("/api/analytics/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/api/analytics/departments")
    public ResponseEntity<List<DepartmentStatDto>> getDepartmentStats() {
        return ResponseEntity.ok(analyticsService.getDepartmentStats());
    }

    @GetMapping("/api/analytics/trends")
    public ResponseEntity<List<TrendPoint>> getIncidentTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getIncidentTrends(days));
    }

    @GetMapping("/api/reports/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam(defaultValue = "CSV") String type) {
        List<IncidentDto> incidents = incidentService.getRecentIncidents(1000);
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Code,Hostname,Employee,Department,FileName,FilePath,FileSizeBytes,")
                .append("DetectionCategory,Severity,RiskScore,Status,PolicyName,PolicyAction,IsSimulated,CreatedAt\n");
        for (IncidentDto inc : incidents) {
            csv.append(csvVal(inc.getId() != null ? inc.getId().toString() : "")).append(",")
                    .append(csvVal(inc.getIncidentCode())).append(",")
                    .append(csvVal(inc.getEndpointHostname())).append(",")
                    .append(csvVal(inc.getEmployeeName())).append(",")
                    .append(csvVal(inc.getDepartmentName())).append(",")
                    .append(csvVal(inc.getFileName())).append(",")
                    .append(csvVal(inc.getFilePath())).append(",")
                    .append(inc.getFileSizeBytes()).append(",")
                    .append(csvVal(inc.getDetectionCategory())).append(",")
                    .append(inc.getSeverity() != null ? inc.getSeverity().name() : "").append(",")
                    .append(inc.getRiskScore()).append(",")
                    .append(inc.getStatus() != null ? inc.getStatus().name() : "").append(",")
                    .append(csvVal(inc.getPolicyName())).append(",")
                    .append(csvVal(inc.getPolicyAction())).append(",")
                    .append(inc.isSimulated()).append(",")
                    .append(inc.getCreatedAt() != null ? inc.getCreatedAt().toString() : "")
                    .append("\n");
        }
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "incidents_export.csv");
        headers.setContentLength(bytes.length);
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    private String csvVal(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
