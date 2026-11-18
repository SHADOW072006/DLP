package com.intellidlp.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DlpPolicyRepository extends JpaRepository<DlpPolicy, UUID> {
    Optional<DlpPolicy> findByName(String name);
    List<DlpPolicy> findByIsActiveTrue();
}

