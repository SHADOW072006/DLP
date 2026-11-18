package com.intellidlp.monitor;

import com.intellidlp.policy.PolicySeverity;

import java.time.Instant;
import java.util.UUID;

public class EventDto {

    private UUID id;
    private UUID endpointId;
    private String hostname;
    private String departmentName;
    private String employeeName;
    private String eventCategory;
    private String eventType;
    private String description;
    private String filePath;
    private PolicySeverity severity;
    private boolean isBlocked;
    private boolean isSimulated;
    private Instant createdAt;

    public EventDto() {
    }

    public EventDto(UUID id, UUID endpointId, String hostname, String departmentName, String employeeName, String eventCategory, String eventType, String description, String filePath, PolicySeverity severity, boolean isBlocked, boolean isSimulated, Instant createdAt) {
        this.id = id;
        this.endpointId = endpointId;
        this.hostname = hostname;
        this.departmentName = departmentName;
        this.employeeName = employeeName;
        this.eventCategory = eventCategory;
        this.eventType = eventType;
        this.description = description;
        this.filePath = filePath;
        this.severity = severity;
        this.isBlocked = isBlocked;
        this.isSimulated = isSimulated;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEndpointId() {
        return endpointId;
    }

    public void setEndpointId(UUID endpointId) {
        this.endpointId = endpointId;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
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

