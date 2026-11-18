package com.intellidlp.incident;

import com.intellidlp.policy.PolicySeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Optional<Incident> findByIncidentCode(String incidentCode);
    Page<Incident> findByStatus(IncidentStatus status, Pageable pageable);
    Page<Incident> findBySeverity(PolicySeverity severity, Pageable pageable);
    Page<Incident> findByStatusAndSeverity(IncidentStatus status, PolicySeverity severity, Pageable pageable);
    long countByStatus(IncidentStatus status);
    long countByRiskScoreGreaterThanEqual(int riskScore);
    List<Incident> findByCreatedAtAfterOrderByCreatedAtAsc(Instant since);
}

