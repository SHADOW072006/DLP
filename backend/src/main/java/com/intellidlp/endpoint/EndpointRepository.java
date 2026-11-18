package com.intellidlp.endpoint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EndpointRepository extends JpaRepository<Endpoint, UUID> {
    Optional<Endpoint> findByHostname(String hostname);
    List<Endpoint> findByStatus(EndpointStatus status);
    List<Endpoint> findByApprovalStatus(DeviceApprovalStatus approvalStatus);
    List<Endpoint> findByDepartmentId(UUID departmentId);
    long countByApprovalStatus(DeviceApprovalStatus approvalStatus);
    long countByStatusAndApprovalStatus(EndpointStatus status, DeviceApprovalStatus approvalStatus);
    long countByDepartmentId(UUID departmentId);
}
