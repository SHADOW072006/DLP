package com.intellidlp.endpoint;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "endpoint_heartbeats", indexes = {
        @Index(name = "idx_heartbeat_time", columnList = "heartbeat_time")
})
public class EndpointHeartbeat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private Endpoint endpoint;

    @CreationTimestamp
    @Column(name = "heartbeat_time", nullable = false)
    private Instant heartbeatTime;

    @Column(name = "status_payload", length = 2048)
    private String statusPayload;

    public EndpointHeartbeat() {
    }

    public EndpointHeartbeat(UUID id, Endpoint endpoint, String statusPayload) {
        this.id = id;
        this.endpoint = endpoint;
        this.statusPayload = statusPayload;
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

    public Instant getHeartbeatTime() {
        return heartbeatTime;
    }

    public void setHeartbeatTime(Instant heartbeatTime) {
        this.heartbeatTime = heartbeatTime;
    }

    public String getStatusPayload() {
        return statusPayload;
    }

    public void setStatusPayload(String statusPayload) {
        this.statusPayload = statusPayload;
    }
}
