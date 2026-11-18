package com.intellidlp.monitor;

import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.endpoint.Endpoint;
import com.intellidlp.endpoint.EndpointRepository;
import com.intellidlp.policy.PolicySeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MonitoredEventService {

    private final MonitoredEventRepository monitoredEventRepository;
    private final EndpointRepository endpointRepository;

    public MonitoredEventService(MonitoredEventRepository monitoredEventRepository,
                                  EndpointRepository endpointRepository) {
        this.monitoredEventRepository = monitoredEventRepository;
        this.endpointRepository = endpointRepository;
    }

    @Transactional(readOnly = true)
    public Page<EventDto> getRecentEvents(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MonitoredEvent> events;
        if (category != null && !category.isBlank()) {
            events = monitoredEventRepository.findByEventCategoryOrderByCreatedAtDesc(category, pageable);
        } else {
            events = monitoredEventRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return events.map(this::toDto);
    }

    @Transactional
    public MonitoredEvent reportEvent(ReportEventRequest req) {
        Endpoint endpoint = endpointRepository.findById(req.getEndpointId())
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint not found: " + req.getEndpointId()));
        MonitoredEvent event = new MonitoredEvent();
        event.setEndpoint(endpoint);
        event.setEventCategory(req.getEventCategory());
        event.setEventType(req.getEventType());
        event.setDescription(req.getDescription());
        event.setFilePath(req.getFilePath());
        event.setSeverity(req.getSeverity() != null ? req.getSeverity() : PolicySeverity.LOW);
        event.setBlocked(req.isBlocked());
        event.setSimulated(req.isSimulated());
        return monitoredEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<EventDto> getLatestEvents(int limit) {
        int effectiveLimit = Math.min(limit, 200);
        List<MonitoredEvent> events = monitoredEventRepository.findTop50ByOrderByCreatedAtDesc();
        return events.stream()
                .limit(effectiveLimit)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private EventDto toDto(MonitoredEvent event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setEventCategory(event.getEventCategory());
        dto.setEventType(event.getEventType());
        dto.setDescription(event.getDescription());
        dto.setFilePath(event.getFilePath());
        dto.setSeverity(event.getSeverity());
        dto.setBlocked(event.isBlocked());
        dto.setSimulated(event.isSimulated());
        dto.setCreatedAt(event.getCreatedAt());

        Endpoint ep = event.getEndpoint();
        if (ep != null) {
            dto.setEndpointId(ep.getId());
            dto.setHostname(ep.getHostname());
            dto.setEmployeeName(ep.getEmployeeName());
            if (ep.getDepartment() != null) {
                dto.setDepartmentName(ep.getDepartment().getName());
            }
        }
        return dto;
    }
}
