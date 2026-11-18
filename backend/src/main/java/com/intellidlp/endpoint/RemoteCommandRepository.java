package com.intellidlp.endpoint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RemoteCommandRepository extends JpaRepository<RemoteCommand, UUID> {
    List<RemoteCommand> findByEndpointIdAndStatusOrderByCreatedAtDesc(UUID endpointId, String status);
    List<RemoteCommand> findByEndpointIdOrderByCreatedAtDesc(UUID endpointId);
}

