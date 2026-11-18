package com.intellidlp.organization;

import java.time.Instant;
import java.util.UUID;

public class DepartmentDto {

    private UUID id;
    private String name;
    private String code;
    private int riskScore;
    private UUID organizationId;
    private long deviceCount;
    private long incidentCount;
    private Instant createdAt;

    public DepartmentDto() {
    }

    public DepartmentDto(UUID id, String name, String code, int riskScore, UUID organizationId, long deviceCount, long incidentCount, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.riskScore = riskScore;
        this.organizationId = organizationId;
        this.deviceCount = deviceCount;
        this.incidentCount = incidentCount;
        this.createdAt = createdAt;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public long getDeviceCount() {
        return deviceCount;
    }

    public void setDeviceCount(long deviceCount) {
        this.deviceCount = deviceCount;
    }

    public long getIncidentCount() {
        return incidentCount;
    }

    public void setIncidentCount(long incidentCount) {
        this.incidentCount = incidentCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

