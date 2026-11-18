package com.intellidlp.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PolicyDecisionRepository extends JpaRepository<PolicyDecision, UUID> {
    List<PolicyDecision> findByScannedFileId(UUID scannedFileId);
    long countByDecisionApplied(PolicyAction decisionApplied);
    long countByIsSimulatedTrue();
}

