package com.intellidlp.monitor;

import com.intellidlp.endpoint.Endpoint;
import com.intellidlp.policy.PolicySeverity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "monitored_events", indexes = {
        @Index(name = "idx_event_category", columnList = "event_category"),
        @Index(name = "idx_event_created_at", columnList = "created_at")
})
public class MonitoredEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id")
    private Endpoint endpoint;

    @Column(name = "event_category", nullable = false, length = 32)
    private String eventCategory; // FILE, USB, DLP, HEALTH

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(nullable = false, length = 512)
    private String description;

    @Column(name = "file_path", length = 1024)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PolicySeverity severity = PolicySeverity.LOW;

    @Column(name = "is_blocked", nullable = false)
    private boolean isBlocked = false;

    @Column(name = "is_simulated", nullable = false)
    private boolean isSimulated = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public MonitoredEvent() {
    }

    public MonitoredEvent(UUID id, Endpoint endpoint, String eventCategory, String eventType, String description, String filePath, PolicySeverity severity, boolean isBlocked, boolean isSimulated) {
        this.id = id;
        this.endpoint = endpoint;
        this.eventCategory = eventCategory;
        this.eventType = eventType;
        this.description = description;
        this.filePath = filePath;
        this.severity = severity != null ? severity : PolicySeverity.LOW;
        this.isBlocked = isBlocked;
        this.isSimulated = isSimulated;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Endpoint getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(Endpoint endpoint) {
        this.endpoint = endpoint;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public PolicySeverity getSeverity() {
        return severity;
    }

    public void setSeverity(PolicySeverity severity) {
        this.severity = severity;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }

    public boolean isSimulated() {
        return isSimulated;
    }

    public void setSimulated(boolean simulated) {
        isSimulated = simulated;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

