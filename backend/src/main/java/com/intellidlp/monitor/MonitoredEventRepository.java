package com.intellidlp.monitor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MonitoredEventRepository extends JpaRepository<MonitoredEvent, UUID> {
    Page<MonitoredEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<MonitoredEvent> findByEventCategoryOrderByCreatedAtDesc(String eventCategory, Pageable pageable);
    List<MonitoredEvent> findTop50ByOrderByCreatedAtDesc();
    long countByEventCategory(String eventCategory);
    long countByIsBlockedTrue();
    long countByIsSimulatedTrue();
}

