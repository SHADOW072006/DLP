package com.intellidlp.policy;

import com.intellidlp.classification.ClassificationLevel;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "dlp_policies")
public class DlpPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 128)
    private String name;

    @Column(length = 512)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_classification", length = 32)
    private ClassificationLevel targetClassification;

    @Column(name = "detection_category", length = 64)
    private String detectionCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PolicyAction action = PolicyAction.WARN;

    @Column(name = "simulation_mode", nullable = false)
    private boolean simulationMode = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PolicySeverity severity = PolicySeverity.MEDIUM;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public DlpPolicy() {
    }

    public DlpPolicy(UUID id, String name, String description, ClassificationLevel targetClassification, String detectionCategory, PolicyAction action, boolean simulationMode, PolicySeverity severity, boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.targetClassification = targetClassification;
        this.detectionCategory = detectionCategory;
        this.action = action != null ? action : PolicyAction.WARN;
        this.simulationMode = simulationMode;
        this.severity = severity != null ? severity : PolicySeverity.MEDIUM;
        this.isActive = isActive;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClassificationLevel getTargetClassification() {
        return targetClassification;
    }

    public void setTargetClassification(ClassificationLevel targetClassification) {
        this.targetClassification = targetClassification;
    }

    public String getDetectionCategory() {
        return detectionCategory;
    }

    public void setDetectionCategory(String detectionCategory) {
        this.detectionCategory = detectionCategory;
    }

    public PolicyAction getAction() {
        return action;
    }

    public void setAction(PolicyAction action) {
        this.action = action;
    }

    public boolean isSimulationMode() {
        return simulationMode;
    }

    public void setSimulationMode(boolean simulationMode) {
        this.simulationMode = simulationMode;
    }

    public PolicySeverity getSeverity() {
        return severity;
    }

    public void setSeverity(PolicySeverity severity) {
        this.severity = severity;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
