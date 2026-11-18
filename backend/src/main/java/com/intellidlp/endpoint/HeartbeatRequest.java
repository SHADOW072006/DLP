package com.intellidlp.endpoint;

public class HeartbeatRequest {

    private String statusPayload;
    private int complianceScore = 100;

    public HeartbeatRequest() {
    }

    public HeartbeatRequest(String statusPayload, int complianceScore) {
        this.statusPayload = statusPayload;
        this.complianceScore = complianceScore;
    }

    public String getStatusPayload() {
        return statusPayload;
    }

    public void setStatusPayload(String statusPayload) {
        this.statusPayload = statusPayload;
    }

    public int getComplianceScore() {
        return complianceScore;
    }

    public void setComplianceScore(int complianceScore) {
        this.complianceScore = complianceScore;
    }
}

