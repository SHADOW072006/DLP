package com.intellidlp.incident;

import com.intellidlp.discovery.ScannedFile;
import com.intellidlp.endpoint.Endpoint;
import com.intellidlp.policy.PolicyDecision;
import com.intellidlp.policy.PolicySeverity;
import com.intellidlp.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents", indexes = {
        @Index(name = "idx_incident_code", columnList = "incident_code"),
        @Index(name = "idx_incident_status", columnList = "status"),
        @Index(name = "idx_incident_severity", columnList = "severity")
})
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "incident_code", nullable = false, unique = true, length = 32)
    private String incidentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id")
    private Endpoint endpoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_file_id", nullable = false)
    private ScannedFile scannedFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_decision_id")
    private PolicyDecision policyDecision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PolicySeverity severity = PolicySeverity.MEDIUM;

    @Column(name = "risk_score", nullable = false)
    private int riskScore = 0;

    @Column(name = "risk_breakdown", length = 2048)
    private String riskBreakdown;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IncidentStatus status = IncidentStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Incident() {
    }

    public Incident(UUID id, String incidentCode, Endpoint endpoint, ScannedFile scannedFile, PolicyDecision policyDecision, PolicySeverity severity, int riskScore, String riskBreakdown, IncidentStatus status, User assignedTo) {
        this.id = id;
        this.incidentCode = incidentCode;
        this.endpoint = endpoint;
        this.scannedFile = scannedFile;
        this.policyDecision = policyDecision;
        this.severity = severity != null ? severity : PolicySeverity.MEDIUM;
        this.riskScore = riskScore;
        this.riskBreakdown = riskBreakdown;
        this.status = status != null ? status : IncidentStatus.OPEN;
        this.assignedTo = assignedTo;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getIncidentCode() {
        return incidentCode;
    }

    public void setIncidentCode(String incidentCode) {
        this.incidentCode = incidentCode;
    }

    public Endpoint getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(Endpoint endpoint) {
        this.endpoint = endpoint;
    }

    public ScannedFile getScannedFile() {
        return scannedFile;
    }

    public void setScannedFile(ScannedFile scannedFile) {
        this.scannedFile = scannedFile;
    }

    public PolicyDecision getPolicyDecision() {
        return policyDecision;
    }

    public void setPolicyDecision(PolicyDecision policyDecision) {
        this.policyDecision = policyDecision;
    }

    public PolicySeverity getSeverity() {
        return severity;
    }

    public void setSeverity(PolicySeverity severity) {
        this.severity = severity;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskBreakdown() {
        return riskBreakdown;
    }

    public void setRiskBreakdown(String riskBreakdown) {
        this.riskBreakdown = riskBreakdown;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
