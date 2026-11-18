package com.intellidlp.ai;

import java.util.UUID;

public class ExplainIncidentRequest {

    private UUID incidentId;

    public ExplainIncidentRequest() {
    }

    public UUID getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(UUID incidentId) {
        this.incidentId = incidentId;
    }
}
