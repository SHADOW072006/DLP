package com.intellidlp.policy;

import com.intellidlp.discovery.ScannedFile;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "policy_decisions", indexes = {
        @Index(name = "idx_decision_applied", columnList = "decision_applied"),
        @Index(name = "idx_is_simulated", columnList = "is_simulated")
})
public class PolicyDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id")
    private DlpPolicy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_file_id", nullable = false)
    private ScannedFile scannedFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision_applied", nullable = false, length = 32)
    private PolicyAction decisionApplied;

    @Column(name = "is_simulated", nullable = false)
    private boolean isSimulated = true;

    @Column(length = 1024)
    private String explanation;

    @CreationTimestamp
    @Column(name = "evaluated_at", updatable = false)
    private Instant evaluatedAt;

    public PolicyDecision() {
    }

    public PolicyDecision(UUID id, DlpPolicy policy, ScannedFile scannedFile, PolicyAction decisionApplied, boolean isSimulated, String explanation) {
        this.id = id;
        this.policy = policy;
        this.scannedFile = scannedFile;
        this.decisionApplied = decisionApplied;
        this.isSimulated = isSimulated;
        this.explanation = explanation;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public DlpPolicy getPolicy() {
        return policy;
    }

    public void setPolicy(DlpPolicy policy) {
        this.policy = policy;
    }

    public ScannedFile getScannedFile() {
        return scannedFile;
    }

    public void setScannedFile(ScannedFile scannedFile) {
        this.scannedFile = scannedFile;
    }

    public PolicyAction getDecisionApplied() {
        return decisionApplied;
    }

    public void setDecisionApplied(PolicyAction decisionApplied) {
        this.decisionApplied = decisionApplied;
    }

    public boolean isSimulated() {
        return isSimulated;
    }

    public void setSimulated(boolean simulated) {
        isSimulated = simulated;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Instant getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(Instant evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
}
