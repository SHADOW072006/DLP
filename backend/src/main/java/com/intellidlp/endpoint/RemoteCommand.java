package com.intellidlp.endpoint;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "remote_commands", indexes = {
        @Index(name = "idx_remote_cmd_endpoint", columnList = "endpoint_id, status")
})
public class RemoteCommand {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private Endpoint endpoint;

    @Column(name = "command_type", nullable = false, length = 64)
    private String commandType;

    @Column(nullable = false, length = 32)
    private String status = "PENDING"; // PENDING, EXECUTED, FAILED

    @Column(name = "issued_by", length = 64)
    private String issuedBy;

    @Column(name = "result_payload", length = 2048)
    private String resultPayload;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public RemoteCommand() {
    }

    public RemoteCommand(UUID id, Endpoint endpoint, String commandType, String status, String issuedBy) {
        this.id = id;
        this.endpoint = endpoint;
        this.commandType = commandType;
        this.status = status != null ? status : "PENDING";
        this.issuedBy = issuedBy;
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

    public String getCommandType() {
        return commandType;
    }

    public void setCommandType(String commandType) {
        this.commandType = commandType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(String issuedBy) {
        this.issuedBy = issuedBy;
    }

    public String getResultPayload() {
        return resultPayload;
    }

    public void setResultPayload(String resultPayload) {
        this.resultPayload = resultPayload;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

