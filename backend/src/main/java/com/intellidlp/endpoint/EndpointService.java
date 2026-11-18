package com.intellidlp.endpoint;

import com.intellidlp.audit.AuditLog;
import com.intellidlp.audit.AuditLogRepository;
import com.intellidlp.common.AppException;
import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.organization.Department;
import com.intellidlp.organization.DepartmentRepository;
import com.intellidlp.policy.DlpPolicy;
import com.intellidlp.policy.DlpPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EndpointService {

    private final EndpointRepository endpointRepository;
    private final DepartmentRepository departmentRepository;
    private final EndpointHeartbeatRepository heartbeatRepository;
    private final RemoteCommandRepository remoteCommandRepository;
    private final DlpPolicyRepository dlpPolicyRepository;
    private final AuditLogRepository auditLogRepository;

    public EndpointService(
            EndpointRepository endpointRepository,
            DepartmentRepository departmentRepository,
            EndpointHeartbeatRepository heartbeatRepository,
            RemoteCommandRepository remoteCommandRepository,
            DlpPolicyRepository dlpPolicyRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.endpointRepository = endpointRepository;
        this.departmentRepository = departmentRepository;
        this.heartbeatRepository = heartbeatRepository;
        this.remoteCommandRepository = remoteCommandRepository;
        this.dlpPolicyRepository = dlpPolicyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public List<EndpointDto> getAllEndpoints() {
        List<Endpoint> endpoints = endpointRepository.findAll();
        Instant now = Instant.now();

        // Calculate dynamic online/offline based on last_seen (offline if > 45 seconds)
        for (Endpoint ep : endpoints) {
            if (ep.getLastSeen() != null) {
                if (Duration.between(ep.getLastSeen(), now).getSeconds() > 45) {
                    if (ep.getStatus() == EndpointStatus.ONLINE) {
                        ep.setStatus(EndpointStatus.OFFLINE);
                        endpointRepository.save(ep);
                    }
                } else if (ep.getApprovalStatus() == DeviceApprovalStatus.APPROVED) {
                    if (ep.getStatus() == EndpointStatus.OFFLINE) {
                        ep.setStatus(EndpointStatus.ONLINE);
                        endpointRepository.save(ep);
                    }
                }
            }
        }

        return endpoints.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EndpointDto getEndpointById(UUID id) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));
        return mapToDto(ep);
    }

    @Transactional
    public EndpointDto registerEndpoint(RegisterEndpointRequest req) {
        Endpoint endpoint = endpointRepository.findByHostname(req.getHostname().trim())
                .orElseGet(() -> {
                    Endpoint newEp = new Endpoint();
                    newEp.setHostname(req.getHostname().trim());
                    newEp.setApprovalStatus(DeviceApprovalStatus.PENDING);
                    newEp.setStatus(EndpointStatus.ONLINE);
                    return newEp;
                });

        endpoint.setIpAddress(req.getIpAddress());
        endpoint.setMacAddress(req.getMacAddress());
        endpoint.setOsVersion(req.getOsVersion());
        endpoint.setAgentVersion(req.getAgentVersion());
        endpoint.setEmployeeName(req.getEmployeeName());
        endpoint.setLastSeen(Instant.now());

        if (req.getDepartmentCode() != null && !req.getDepartmentCode().isBlank()) {
            departmentRepository.findByCode(req.getDepartmentCode().trim().toUpperCase())
                    .ifPresent(endpoint::setDepartment);
        }

        Endpoint saved = endpointRepository.save(endpoint);
        return mapToDto(saved);
    }

    @Transactional
    public EndpointDto approveEndpoint(UUID id, String adminUser, String clientIp) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        ep.setApprovalStatus(DeviceApprovalStatus.APPROVED);
        ep.setStatus(EndpointStatus.ONLINE);
        ep.setDeviceToken(UUID.randomUUID().toString());
        Endpoint saved = endpointRepository.save(ep);

        auditLogRepository.save(new AuditLog(
                null,
                null,
                "DEVICE_APPROVED",
                "Endpoint:" + ep.getHostname(),
                clientIp,
                "SUCCESS",
                "Administrator " + adminUser + " approved device registration"
        ));

        return mapToDto(saved);
    }

    @Transactional
    public EndpointDto rejectEndpoint(UUID id, String adminUser, String clientIp) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        ep.setApprovalStatus(DeviceApprovalStatus.REJECTED);
        ep.setStatus(EndpointStatus.OFFLINE);
        Endpoint saved = endpointRepository.save(ep);

        auditLogRepository.save(new AuditLog(
                null,
                null,
                "DEVICE_REJECTED",
                "Endpoint:" + ep.getHostname(),
                clientIp,
                "SUCCESS",
                "Administrator " + adminUser + " rejected device registration"
        ));

        return mapToDto(saved);
    }

    @Transactional
    public EndpointDto suspendEndpoint(UUID id, String adminUser, String clientIp) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        DeviceApprovalStatus newStatus = ep.getApprovalStatus() == DeviceApprovalStatus.SUSPENDED
                ? DeviceApprovalStatus.APPROVED
                : DeviceApprovalStatus.SUSPENDED;

        ep.setApprovalStatus(newStatus);
        Endpoint saved = endpointRepository.save(ep);

        auditLogRepository.save(new AuditLog(
                null,
                null,
                "DEVICE_STATUS_CHANGED",
                "Endpoint:" + ep.getHostname(),
                clientIp,
                "SUCCESS",
                "Status changed to " + newStatus
        ));

        return mapToDto(saved);
    }

    @Transactional
    public EndpointDto assignDepartment(UUID id, UUID departmentId) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));

        ep.setDepartment(dept);
        Endpoint saved = endpointRepository.save(ep);
        return mapToDto(saved);
    }

    @Transactional
    public void recordHeartbeat(UUID id, HeartbeatRequest req) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        ep.setLastSeen(Instant.now());
        if (ep.getApprovalStatus() == DeviceApprovalStatus.APPROVED) {
            ep.setStatus(EndpointStatus.ONLINE);
        }
        if (req.getComplianceScore() > 0) {
            ep.setComplianceScore(req.getComplianceScore());
        }
        endpointRepository.save(ep);

        heartbeatRepository.save(new EndpointHeartbeat(null, ep, req.getStatusPayload()));
    }

    @Transactional
    public RemoteCommand issueCommand(UUID id, String commandType, String adminUser) {
        Endpoint ep = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endpoint", "id", id));

        RemoteCommand cmd = new RemoteCommand(null, ep, commandType, "PENDING", adminUser);
        return remoteCommandRepository.save(cmd);
    }

    @Transactional(readOnly = true)
    public List<RemoteCommand> getPendingCommands(UUID id) {
        return remoteCommandRepository.findByEndpointIdAndStatusOrderByCreatedAtDesc(id, "PENDING");
    }

    @Transactional(readOnly = true)
    public List<DlpPolicy> getEffectivePolicies(UUID id) {
        return dlpPolicyRepository.findByIsActiveTrue();
    }

    private EndpointDto mapToDto(Endpoint ep) {
        UUID deptId = ep.getDepartment() != null ? ep.getDepartment().getId() : null;
        String deptName = ep.getDepartment() != null ? ep.getDepartment().getName() : "Unassigned";

        return new EndpointDto(
                ep.getId(),
                ep.getHostname(),
                ep.getIpAddress(),
                ep.getMacAddress(),
                ep.getOsVersion(),
                ep.getAgentVersion(),
                ep.getStatus(),
                ep.getApprovalStatus(),
                deptId,
                deptName,
                ep.getEmployeeName(),
                ep.getComplianceScore(),
                ep.getLastSeen(),
                ep.getLastSyncTime(),
                ep.getRegisteredAt()
        );
    }
}

