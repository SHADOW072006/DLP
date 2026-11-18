package com.intellidlp.classification;

import com.intellidlp.discovery.ScannedFile;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "data_findings", indexes = {
        @Index(name = "idx_data_findings_type", columnList = "finding_type")
})
public class DataFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_file_id", nullable = false)
    private ScannedFile scannedFile;

    @Column(name = "finding_type", nullable = false, length = 64)
    private String findingType;

    @Column(name = "masked_value", nullable = false, length = 255)
    private String maskedValue;

    @Column(name = "confidence_score", nullable = false)
    private double confidenceScore;

    @Column(name = "match_count", nullable = false)
    private int matchCount = 1;

    @Column(name = "start_offset")
    private int startOffset;

    @Column(name = "end_offset")
    private int endOffset;

    @CreationTimestamp
    @Column(name = "detected_at", updatable = false)
    private Instant detectedAt;

    public DataFinding() {
    }

    public DataFinding(UUID id, ScannedFile scannedFile, String findingType, String maskedValue, double confidenceScore, int matchCount, int startOffset, int endOffset) {
        this.id = id;
        this.scannedFile = scannedFile;
        this.findingType = findingType;
        this.maskedValue = maskedValue;
        this.confidenceScore = confidenceScore;
        this.matchCount = matchCount;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ScannedFile getScannedFile() {
        return scannedFile;
    }

    public void setScannedFile(ScannedFile scannedFile) {
        this.scannedFile = scannedFile;
    }

    public String getFindingType() {
        return findingType;
    }

    public void setFindingType(String findingType) {
        this.findingType = findingType;
    }

    public String getMaskedValue() {
        return maskedValue;
    }

    public void setMaskedValue(String maskedValue) {
        this.maskedValue = maskedValue;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public int getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(int matchCount) {
        this.matchCount = matchCount;
    }

    public int getStartOffset() {
        return startOffset;
    }

    public void setStartOffset(int startOffset) {
        this.startOffset = startOffset;
    }

    public int getEndOffset() {
        return endOffset;
    }

    public void setEndOffset(int endOffset) {
        this.endOffset = endOffset;
    }

    public Instant getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(Instant detectedAt) {
        this.detectedAt = detectedAt;
    }
}
