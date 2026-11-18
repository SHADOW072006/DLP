package com.intellidlp.incident;

import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.discovery.ScannedFile;
import com.intellidlp.endpoint.Endpoint;
import com.intellidlp.policy.PolicyDecision;
import com.intellidlp.user.User;
import com.intellidlp.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentNoteRepository incidentNoteRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository,
                            IncidentNoteRepository incidentNoteRepository,
                            UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.incidentNoteRepository = incidentNoteRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<IncidentDto> getIncidents(String status, String severity, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSeverity = severity != null && !severity.isBlank();

        if (hasStatus && hasSeverity) {
            IncidentStatus statusEnum = IncidentStatus.valueOf(status.toUpperCase());
            com.intellidlp.policy.PolicySeverity severityEnum =
                    com.intellidlp.policy.PolicySeverity.valueOf(severity.toUpperCase());
            Page<Incident> raw = incidentRepository.findByStatusAndSeverity(statusEnum, severityEnum, pageable);
            return raw.map(this::toDto);
        } else if (hasStatus) {
            IncidentStatus statusEnum = IncidentStatus.valueOf(status.toUpperCase());
            Page<Incident> raw = incidentRepository.findByStatus(statusEnum, pageable);
            return raw.map(this::toDto);
        } else if (hasSeverity) {
            com.intellidlp.policy.PolicySeverity severityEnum =
                    com.intellidlp.policy.PolicySeverity.valueOf(severity.toUpperCase());
            Page<Incident> raw = incidentRepository.findBySeverity(severityEnum, pageable);
            return raw.map(this::toDto);
        } else {
            Page<Incident> raw = incidentRepository.findAll(pageable);
            return raw.map(this::toDto);
        }
    }

    @Transactional(readOnly = true)
    public IncidentDto getIncidentById(UUID id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
        List<IncidentNote> notes = incidentNoteRepository.findByIncidentIdOrderByCreatedAtDesc(id);
        IncidentDto dto = toDto(incident);
        dto.setNotes(notes.stream().map(this::toNoteDto).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public IncidentDto updateStatus(UUID id, String newStatus) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
        incident.setStatus(IncidentStatus.valueOf(newStatus.toUpperCase()));
        incidentRepository.save(incident);
        return getIncidentById(id);
    }

    @Transactional
    public IncidentNote addNote(UUID incidentId, String noteText, UUID userId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + incidentId));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        IncidentNote note = new IncidentNote();
        note.setIncident(incident);
        note.setAuthor(author);
        note.setNoteText(noteText);
        return incidentNoteRepository.save(note);
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> getRecentIncidents(int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 200), Sort.by(Sort.Direction.DESC, "createdAt"));
        return incidentRepository.findAll(pageable)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private IncidentDto toDto(Incident incident) {
        IncidentDto dto = new IncidentDto();
        dto.setId(incident.getId());
        dto.setIncidentCode(incident.getIncidentCode());
        dto.setSeverity(incident.getSeverity());
        dto.setRiskScore(incident.getRiskScore());
        dto.setRiskBreakdown(incident.getRiskBreakdown());
        dto.setStatus(incident.getStatus());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());

        Endpoint ep = incident.getEndpoint();
        if (ep != null) {
            dto.setEndpointHostname(ep.getHostname());
            dto.setEmployeeName(ep.getEmployeeName());
            if (ep.getDepartment() != null) {
                dto.setDepartmentName(ep.getDepartment().getName());
            }
        }

        ScannedFile sf = incident.getScannedFile();
        if (sf != null) {
            dto.setFilePath(sf.getFilePath());
            dto.setFileName(sf.getFileName());
            dto.setFileSizeBytes(sf.getFileSizeBytes());
        }

        PolicyDecision pd = incident.getPolicyDecision();
        if (pd != null) {
            dto.setSimulated(pd.isSimulated());
            if (pd.getDecisionApplied() != null) {
                dto.setPolicyAction(pd.getDecisionApplied().name());
            }
            if (pd.getPolicy() != null) {
                dto.setPolicyName(pd.getPolicy().getName());
                dto.setDetectionCategory(pd.getPolicy().getDetectionCategory());
            }
        }

        return dto;
    }

    private IncidentNoteDto toNoteDto(IncidentNote note) {
        IncidentNoteDto dto = new IncidentNoteDto();
        dto.setId(note.getId());
        dto.setNoteText(note.getNoteText());
        dto.setCreatedAt(note.getCreatedAt());
        if (note.getAuthor() != null) {
            dto.setAuthorUsername(note.getAuthor().getUsername());
        }
        return dto;
    }
}
