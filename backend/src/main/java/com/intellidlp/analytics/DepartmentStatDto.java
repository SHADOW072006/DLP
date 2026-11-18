package com.intellidlp.analytics;

import java.util.UUID;

public class DepartmentStatDto {

    private UUID departmentId;
    private String departmentName;
    private long deviceCount;
    private long incidentCount;
    private int riskScore;

    public DepartmentStatDto() {
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

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }
}
