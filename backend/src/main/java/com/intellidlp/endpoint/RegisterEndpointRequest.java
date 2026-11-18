package com.intellidlp.endpoint;

import jakarta.validation.constraints.NotBlank;

public class RegisterEndpointRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private String ipAddress;
    private String macAddress;
    private String osVersion;
    private String agentVersion;
    private String departmentCode;
    private String employeeName;

    public RegisterEndpointRequest() {
    }

    public RegisterEndpointRequest(String hostname, String ipAddress, String macAddress, String osVersion, String agentVersion, String departmentCode, String employeeName) {
        this.hostname = hostname;
        this.ipAddress = ipAddress;
        this.macAddress = macAddress;
        this.osVersion = osVersion;
        this.agentVersion = agentVersion;
        this.departmentCode = departmentCode;
        this.employeeName = employeeName;
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

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
}

