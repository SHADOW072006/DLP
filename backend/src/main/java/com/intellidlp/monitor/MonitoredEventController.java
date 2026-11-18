package com.intellidlp.monitor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@PreAuthorize("isAuthenticated()")
public class MonitoredEventController {

    private final MonitoredEventService monitoredEventService;

    public MonitoredEventController(MonitoredEventService monitoredEventService) {
        this.monitoredEventService = monitoredEventService;
    }

    @GetMapping
    public ResponseEntity<Page<EventDto>> getRecentEvents(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(monitoredEventService.getRecentEvents(category, page, size));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<EventDto>> getLatestEvents(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(monitoredEventService.getLatestEvents(limit));
    }

    @PostMapping("/report")
    public ResponseEntity<MonitoredEvent> reportEvent(@RequestBody ReportEventRequest request) {
        return ResponseEntity.ok(monitoredEventService.reportEvent(request));
    }
}
