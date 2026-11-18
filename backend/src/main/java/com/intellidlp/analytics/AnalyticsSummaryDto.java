package com.intellidlp.analytics;

public class AnalyticsSummaryDto {

    private long totalEndpoints;
    private long onlineEndpoints;
    private long offlineEndpoints;
    private long pendingApprovals;
    private long totalScannedFiles;
    private long sensitiveFiles;
    private long openIncidents;
    private long highRiskIncidents;
    private long blockedActions;
    private long simulatedDecisions;
    private double compliancePercent;
    private long totalEvents;

    public AnalyticsSummaryDto() {
    }

    public long getTotalEndpoints() {
        return totalEndpoints;
    }

    public void setTotalEndpoints(long totalEndpoints) {
        this.totalEndpoints = totalEndpoints;
    }

    public long getOnlineEndpoints() {
        return onlineEndpoints;
    }

    public void setOnlineEndpoints(long onlineEndpoints) {
        this.onlineEndpoints = onlineEndpoints;
    }

    public long getOfflineEndpoints() {
        return offlineEndpoints;
    }

    public void setOfflineEndpoints(long offlineEndpoints) {
        this.offlineEndpoints = offlineEndpoints;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public long getTotalScannedFiles() {
        return totalScannedFiles;
    }

    public void setTotalScannedFiles(long totalScannedFiles) {
        this.totalScannedFiles = totalScannedFiles;
    }

    public long getSensitiveFiles() {
        return sensitiveFiles;
    }

    public void setSensitiveFiles(long sensitiveFiles) {
        this.sensitiveFiles = sensitiveFiles;
    }

    public long getOpenIncidents() {
        return openIncidents;
    }

    public void setOpenIncidents(long openIncidents) {
        this.openIncidents = openIncidents;
    }

    public long getHighRiskIncidents() {
        return highRiskIncidents;
    }

    public void setHighRiskIncidents(long highRiskIncidents) {
        this.highRiskIncidents = highRiskIncidents;
    }

    public long getBlockedActions() {
        return blockedActions;
    }

    public void setBlockedActions(long blockedActions) {
        this.blockedActions = blockedActions;
    }

    public long getSimulatedDecisions() {
        return simulatedDecisions;
    }

    public void setSimulatedDecisions(long simulatedDecisions) {
        this.simulatedDecisions = simulatedDecisions;
    }

    public double getCompliancePercent() {
        return compliancePercent;
    }

    public void setCompliancePercent(double compliancePercent) {
        this.compliancePercent = compliancePercent;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }
}
