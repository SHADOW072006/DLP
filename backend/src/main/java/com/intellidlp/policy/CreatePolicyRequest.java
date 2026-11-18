package com.intellidlp.policy;

import com.intellidlp.classification.ClassificationLevel;

public class CreatePolicyRequest {

    private String name;
    private String description;
    private ClassificationLevel targetClassification;
    private String detectionCategory;
    private PolicyAction action;
    private boolean simulationMode;
    private PolicySeverity severity;
    private boolean isActive;

    public CreatePolicyRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClassificationLevel getTargetClassification() {
        return targetClassification;
    }

    public void setTargetClassification(ClassificationLevel targetClassification) {
        this.targetClassification = targetClassification;
    }

    public String getDetectionCategory() {
        return detectionCategory;
    }

    public void setDetectionCategory(String detectionCategory) {
        this.detectionCategory = detectionCategory;
    }

    public PolicyAction getAction() {
        return action;
    }

    public void setAction(PolicyAction action) {
        this.action = action;
    }

    public boolean isSimulationMode() {
        return simulationMode;
    }

    public void setSimulationMode(boolean simulationMode) {
        this.simulationMode = simulationMode;
    }

    public PolicySeverity getSeverity() {
        return severity;
    }

    public void setSeverity(PolicySeverity severity) {
        this.severity = severity;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
