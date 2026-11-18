package com.intellidlp.analytics;

import com.intellidlp.classification.DataFindingRepository;
import com.intellidlp.discovery.ScannedFileRepository;
import com.intellidlp.endpoint.DeviceApprovalStatus;
import com.intellidlp.endpoint.Endpoint;
import com.intellidlp.endpoint.EndpointRepository;
import com.intellidlp.endpoint.EndpointStatus;
import com.intellidlp.incident.Incident;
import com.intellidlp.incident.IncidentRepository;
import com.intellidlp.incident.IncidentStatus;
import com.intellidlp.monitor.MonitoredEventRepository;
import com.intellidlp.organization.Department;
import com.intellidlp.organization.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

    private final EndpointRepository endpointRepository;
    private final IncidentRepository incidentRepository;
    private final ScannedFileRepository scannedFileRepository;
    private final DataFindingRepository dataFindingRepository;
    private final MonitoredEventRepository monitoredEventRepository;
    private final DepartmentRepository departmentRepository;

    public AnalyticsService(EndpointRepository endpointRepository,
                             IncidentRepository incidentRepository,
                             ScannedFileRepository scannedFileRepository,
                             DataFindingRepository dataFindingRepository,
                             MonitoredEventRepository monitoredEventRepository,
                             DepartmentRepository departmentRepository) {
        this.endpointRepository = endpointRepository;
        this.incidentRepository = incidentRepository;
        this.scannedFileRepository = scannedFileRepository;
        this.dataFindingRepository = dataFindingRepository;
        this.monitoredEventRepository = monitoredEventRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary() {
        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();

        long totalEndpoints = endpointRepository.count();
        long onlineEndpoints = endpointRepository.countByStatusAndApprovalStatus(
                EndpointStatus.ONLINE, DeviceApprovalStatus.APPROVED);
        long pendingApprovals = endpointRepository.countByApprovalStatus(DeviceApprovalStatus.PENDING);
        long offlineEndpoints = totalEndpoints - onlineEndpoints - pendingApprovals;

        dto.setTotalEndpoints(totalEndpoints);
        dto.setOnlineEndpoints(onlineEndpoints);
        dto.setOfflineEndpoints(Math.max(0, offlineEndpoints));
        dto.setPendingApprovals(pendingApprovals);

        dto.setTotalScannedFiles(scannedFileRepository.count());
        dto.setSensitiveFiles(dataFindingRepository.count());

        dto.setOpenIncidents(incidentRepository.countByStatus(IncidentStatus.OPEN));
        dto.setHighRiskIncidents(incidentRepository.countByRiskScoreGreaterThanEqual(70));

        dto.setBlockedActions(monitoredEventRepository.countByIsBlockedTrue());
        dto.setSimulatedDecisions(monitoredEventRepository.countByIsSimulatedTrue());
        dto.setTotalEvents(monitoredEventRepository.count());

        // Compute avg compliance score of APPROVED endpoints
        List<Endpoint> approvedEndpoints = endpointRepository.findByApprovalStatus(DeviceApprovalStatus.APPROVED);
        double avgCompliance = approvedEndpoints.isEmpty() ? 100.0 :
                approvedEndpoints.stream()
                        .mapToInt(Endpoint::getComplianceScore)
                        .average()
                        .orElse(100.0);
        dto.setCompliancePercent(Math.round(avgCompliance * 100.0) / 100.0);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<DepartmentStatDto> getDepartmentStats() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentStatDto> result = new ArrayList<>();
        for (Department dept : departments) {
            DepartmentStatDto stat = new DepartmentStatDto();
            stat.setDepartmentId(dept.getId());
            stat.setDepartmentName(dept.getName());
            stat.setRiskScore(dept.getRiskScore());

            long deviceCount = endpointRepository.countByDepartmentId(dept.getId());
            stat.setDeviceCount(deviceCount);

            // Count incidents via endpoints in this department
            List<Endpoint> deptEndpoints = endpointRepository.findByDepartmentId(dept.getId());
            long incidentCount = 0;
            for (Endpoint ep : deptEndpoints) {
                // We'll count all incidents for each endpoint through the incident table
                incidentCount += countIncidentsByEndpointId(ep);
            }
            stat.setIncidentCount(incidentCount);
            result.add(stat);
        }
        return result;
    }

    private long countIncidentsByEndpointId(Endpoint endpoint) {
        // Use findAll and filter — simple approach to avoid new repository methods
        return incidentRepository.findAll().stream()
                .filter(i -> i.getEndpoint() != null && endpoint.getId().equals(i.getEndpoint().getId()))
                .count();
    }

    @Transactional(readOnly = true)
    public List<TrendPoint> getIncidentTrends(int days) {
        Instant since = Instant.now().minusSeconds((long) days * 86400L);
        List<Incident> incidents = incidentRepository.findByCreatedAtAfterOrderByCreatedAtAsc(since);

        // Group by date string
        Map<String, Long> grouped = new LinkedHashMap<>();
        // Pre-populate all dates with zero
        for (int i = days - 1; i >= 0; i--) {
            Instant dayInstant = Instant.now().minusSeconds((long) i * 86400L);
            String dateKey = DATE_FMT.format(dayInstant);
            grouped.put(dateKey, 0L);
        }
        // Fill in actual counts
        for (Incident incident : incidents) {
            if (incident.getCreatedAt() != null) {
                String dateKey = DATE_FMT.format(incident.getCreatedAt());
                grouped.merge(dateKey, 1L, Long::sum);
            }
        }

        return grouped.entrySet().stream()
                .map(e -> new TrendPoint(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }
}
