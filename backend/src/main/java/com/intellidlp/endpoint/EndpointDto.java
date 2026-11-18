package com.intellidlp.endpoint;

import java.time.Instant;
import java.util.UUID;

public class EndpointDto {

    private UUID id;
    private String hostname;
    private String ipAddress;
    private String macAddress;
    private String osVersion;
    private String agentVersion;
    private EndpointStatus status;
    private DeviceApprovalStatus approvalStatus;
    private UUID departmentId;
    private String departmentName;
    private String employeeName;
    private int complianceScore;
    private Instant lastSeen;
    private Instant lastSyncTime;
    private Instant registeredAt;

    public EndpointDto() {
    }

    public EndpointDto(UUID id, String hostname, String ipAddress, String macAddress, String osVersion, String agentVersion, EndpointStatus status, DeviceApprovalStatus approvalStatus, UUID departmentId, String departmentName, String employeeName, int complianceScore, Instant lastSeen, Instant lastSyncTime, Instant registeredAt) {
        this.id = id;
        this.hostname = hostname;
        this.ipAddress = ipAddress;
        this.macAddress = macAddress;
        this.osVersion = osVersion;
        this.agentVersion = agentVersion;
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.employeeName = employeeName;
        this.complianceScore = complianceScore;
        this.lastSeen = lastSeen;
        this.lastSyncTime = lastSyncTime;
        this.registeredAt = registeredAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getMacAddress() {
        return macAddress;
    }

    public void setMacAddress(String macAddress) {
        this.macAddress = macAddress;
    }

    public String getOsVersion() {
        return osVersion;
    }

    public void setOsVersion(String osVersion) {
        this.osVersion = osVersion;
    }

    public String getAgentVersion() {
        return agentVersion;
    }

    public void setAgentVersion(String agentVersion) {
        this.agentVersion = agentVersion;
    }

    public EndpointStatus getStatus() {
        return status;
    }

    public void setStatus(EndpointStatus status) {
        this.status = status;
    }

    public DeviceApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(DeviceApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
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

    public int getComplianceScore() {
        return complianceScore;
    }

    public void setComplianceScore(int complianceScore) {
        this.complianceScore = complianceScore;
    }

    public Instant getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(Instant lastSeen) {
        this.lastSeen = lastSeen;
    }

    public Instant getLastSyncTime() {
        return lastSyncTime;
    }

    public void setLastSyncTime(Instant lastSyncTime) {
        this.lastSyncTime = lastSyncTime;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Instant registeredAt) {
        this.registeredAt = registeredAt;
    }
}

