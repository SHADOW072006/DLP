package com.intellidlp.organization;

import com.intellidlp.common.AppException;
import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.endpoint.EndpointRepository;
import com.intellidlp.incident.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final EndpointRepository endpointRepository;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            DepartmentRepository departmentRepository,
            EndpointRepository endpointRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.endpointRepository = endpointRepository;
    }

    @Transactional(readOnly = true)
    public OrganizationDto getOrganization() {
        Organization org = organizationRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Organization defaultOrg = new Organization(null, "CyberCorp Global Defense", "CYBERCORP", "soc@cybercorp.local");
                    return organizationRepository.save(defaultOrg);
                });

        int deptCount = (int) departmentRepository.count();
        return new OrganizationDto(org.getId(), org.getName(), org.getCode(), org.getContactEmail(), org.getCreatedAt(), deptCount);
    }

    @Transactional
    public OrganizationDto updateOrganization(OrganizationDto dto) {
        Organization org = organizationRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new AppException("Organization not configured"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            org.setName(dto.getName().trim());
        }
        if (dto.getContactEmail() != null && !dto.getContactEmail().isBlank()) {
            org.setContactEmail(dto.getContactEmail().trim());
        }

        Organization saved = organizationRepository.save(org);
        int deptCount = (int) departmentRepository.count();
        return new OrganizationDto(saved.getId(), saved.getName(), saved.getCode(), saved.getContactEmail(), saved.getCreatedAt(), deptCount);
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDepartmentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest req) {
        if (departmentRepository.findByCode(req.getCode().toUpperCase()).isPresent()) {
            throw new AppException("Department code already exists: " + req.getCode());
        }

        Organization org = organizationRepository.findAll().stream().findFirst()
                .orElseGet(() -> organizationRepository.save(new Organization(null, "CyberCorp Global Defense", "CYBERCORP", "soc@cybercorp.local")));

        Department dept = new Department(
                null,
                org,
                req.getName().trim(),
                req.getCode().trim().toUpperCase(),
                15 // Baseline initial department risk score
        );

        Department saved = departmentRepository.save(dept);
        return mapToDepartmentDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(UUID id, CreateDepartmentRequest req) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        dept.setName(req.getName().trim());
        Department saved = departmentRepository.save(dept);
        return mapToDepartmentDto(saved);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        long deviceCount = endpointRepository.countByDepartmentId(id);
        if (deviceCount > 0) {
            throw new AppException("Cannot delete department with " + deviceCount + " assigned endpoints. Reassign endpoints first.");
        }

        departmentRepository.delete(dept);
    }

    private DepartmentDto mapToDepartmentDto(Department dept) {
        long deviceCount = endpointRepository.countByDepartmentId(dept.getId());
        return new DepartmentDto(
                dept.getId(),
                dept.getName(),
                dept.getCode(),
                dept.getRiskScore(),
                dept.getOrganization().getId(),
                deviceCount,
                0, // Dynamic incident count
                dept.getCreatedAt()
        );
    }
}

