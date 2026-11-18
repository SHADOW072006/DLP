package com.intellidlp.endpoint;

import com.intellidlp.organization.Department;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "endpoints", indexes = {
        @Index(name = "idx_endpoint_hostname", columnList = "hostname"),
        @Index(name = "idx_endpoint_status", columnList = "status"),
        @Index(name = "idx_endpoint_approval", columnList = "approval_status")
})
public class Endpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 128)
    private String hostname;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "mac_address", length = 64)
    private String macAddress;

    @Column(name = "os_version", length = 128)
    private String osVersion;

    @Column(name = "agent_version", length = 32)
    private String agentVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EndpointStatus status = EndpointStatus.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 24)
    private DeviceApprovalStatus approvalStatus = DeviceApprovalStatus.APPROVED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "employee_name", length = 128)
    private String employeeName;

    @Column(name = "device_token", length = 255)
    private String deviceToken;

    @Column(name = "compliance_score", nullable = false)
    private int complianceScore = 100;

    @Column(name = "last_seen")
    private Instant lastSeen;

    @Column(name = "last_sync_time")
    private Instant lastSyncTime;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    private Instant registeredAt;

    public Endpoint() {
    }

    public Endpoint(UUID id, String hostname, String ipAddress, String macAddress, String osVersion, String agentVersion, EndpointStatus status, Instant lastSeen) {
        this.id = id;
        this.hostname = hostname;
        this.ipAddress = ipAddress;
        this.macAddress = macAddress;
        this.osVersion = osVersion;
        this.agentVersion = agentVersion;
        this.status = status != null ? status : EndpointStatus.ONLINE;
        this.approvalStatus = DeviceApprovalStatus.APPROVED;
        this.lastSeen = lastSeen;
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDeviceToken() {
        return deviceToken;
    }

    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
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
