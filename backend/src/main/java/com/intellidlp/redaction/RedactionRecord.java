package com.intellidlp.redaction;

import com.intellidlp.discovery.ScannedFile;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "redaction_records")
public class RedactionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_file_id", nullable = false)
    private ScannedFile originalFile;

    @Column(name = "redacted_file_path", nullable = false, length = 1024)
    private String redactedFilePath;

    @Column(name = "redacted_count", nullable = false)
    private int redactedCount = 0;

    @CreationTimestamp
    @Column(name = "redacted_at", updatable = false)
    private Instant redactedAt;

    public RedactionRecord() {
    }

    public RedactionRecord(UUID id, ScannedFile originalFile, String redactedFilePath, int redactedCount) {
        this.id = id;
        this.originalFile = originalFile;
        this.redactedFilePath = redactedFilePath;
        this.redactedCount = redactedCount;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ScannedFile getOriginalFile() {
        return originalFile;
    }

    public void setOriginalFile(ScannedFile originalFile) {
        this.originalFile = originalFile;
    }

    public String getRedactedFilePath() {
        return redactedFilePath;
    }

    public void setRedactedFilePath(String redactedFilePath) {
        this.redactedFilePath = redactedFilePath;
    }

    public int getRedactedCount() {
        return redactedCount;
    }

    public void setRedactedCount(int redactedCount) {
        this.redactedCount = redactedCount;
    }

    public Instant getRedactedAt() {
        return redactedAt;
    }

    public void setRedactedAt(Instant redactedAt) {
        this.redactedAt = redactedAt;
    }
}
