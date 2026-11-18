package com.intellidlp.incident;

import com.intellidlp.policy.PolicySeverity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class IncidentDto {

    private UUID id;
    private String incidentCode;
    private String endpointHostname;
    private String employeeName;
    private String departmentName;
    private String filePath;
    private String fileName;
    private long fileSizeBytes;
    private String detectionCategory;
    private PolicySeverity severity;
    private int riskScore;
    private String riskBreakdown;
    private IncidentStatus status;
    private String policyName;
    private String policyAction;
    private boolean isSimulated;
    private Instant createdAt;
    private Instant updatedAt;
    private List<IncidentNoteDto> notes = new ArrayList<>();

    public IncidentDto() {
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

    public String getEndpointHostname() {
        return endpointHostname;
    }

    public void setEndpointHostname(String endpointHostname) {
        this.endpointHostname = endpointHostname;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getDetectionCategory() {
        return detectionCategory;
    }

    public void setDetectionCategory(String detectionCategory) {
        this.detectionCategory = detectionCategory;
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

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getPolicyAction() {
        return policyAction;
    }

    public void setPolicyAction(String policyAction) {
        this.policyAction = policyAction;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<IncidentNoteDto> getNotes() {
        return notes;
    }

    public void setNotes(List<IncidentNoteDto> notes) {
        this.notes = notes;
    }
}
