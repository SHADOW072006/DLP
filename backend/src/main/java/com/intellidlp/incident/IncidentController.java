package com.intellidlp.incident;

import com.intellidlp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@PreAuthorize("isAuthenticated()")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<Page<IncidentDto>> getIncidents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(incidentService.getIncidents(status, severity, page, size));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<IncidentDto>> getRecentIncidents(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(incidentService.getRecentIncidents(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDto> getIncidentById(@PathVariable UUID id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_ANALYST')")
    public ResponseEntity<IncidentDto> updateStatus(@PathVariable UUID id,
                                                     @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(incidentService.updateStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_ANALYST')")
    public ResponseEntity<IncidentNote> addNote(@PathVariable UUID id,
                                                 @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        String noteText = body.get("noteText");
        if (noteText == null || noteText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        IncidentNote note = incidentService.addNote(id, noteText, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }
}
