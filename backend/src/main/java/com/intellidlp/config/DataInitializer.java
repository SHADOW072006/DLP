package com.intellidlp.config;

import com.intellidlp.classification.ClassificationLevel;
import com.intellidlp.classification.ClassificationRule;
import com.intellidlp.classification.ClassificationRuleRepository;
import com.intellidlp.endpoint.*;
import com.intellidlp.organization.*;
import com.intellidlp.policy.DlpPolicy;
import com.intellidlp.policy.DlpPolicyRepository;
import com.intellidlp.policy.PolicyAction;
import com.intellidlp.policy.PolicySeverity;
import com.intellidlp.user.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassificationRuleRepository classificationRuleRepository;
    private final DlpPolicyRepository dlpPolicyRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final EndpointRepository endpointRepository;
    private final MonitoredDirectoryRepository monitoredDirectoryRepository;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ClassificationRuleRepository classificationRuleRepository,
            DlpPolicyRepository dlpPolicyRepository,
            OrganizationRepository organizationRepository,
            DepartmentRepository departmentRepository,
            EndpointRepository endpointRepository,
            MonitoredDirectoryRepository monitoredDirectoryRepository
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.classificationRuleRepository = classificationRuleRepository;
        this.dlpPolicyRepository = dlpPolicyRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.endpointRepository = endpointRepository;
        this.monitoredDirectoryRepository = monitoredDirectoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing IntelliDLP foundational security roles and initial accounts...");

        // 1. Seed Roles
        Role adminRole = getOrCreateRole(RoleType.ROLE_ADMIN, "Full system administration and policy control");
        Role analystRole = getOrCreateRole(RoleType.ROLE_ANALYST, "Incident investigation and evidence review");
        Role userRole = getOrCreateRole(RoleType.ROLE_USER, "Standard endpoint employee");

        // 2. Seed Default Accounts
        getOrCreateUser("admin", "admin@intellidlp.local", "Admin@IntelliDLP2026!", "Security Administrator", adminRole);
        getOrCreateUser("analyst", "analyst@intellidlp.local", "Analyst@IntelliDLP2026!", "SOC Security Analyst", analystRole);
        getOrCreateUser("user", "user@intellidlp.local", "User@IntelliDLP2026!", "Endpoint User", userRole);

        // 3. Seed Default Organization & Departments
        Organization org = organizationRepository.findByCode("CYBERCORP").orElseGet(() ->
                organizationRepository.save(new Organization(null, "CyberCorp Defense Systems", "CYBERCORP", "soc@cybercorp.local"))
        );

        Department itDept = getOrCreateDepartment(org, "IT Operations & Infrastructure", "IT-OPS", 10);
        Department finDept = getOrCreateDepartment(org, "Finance & Treasury", "FIN", 45);
        Department hrDept = getOrCreateDepartment(org, "Human Resources", "HR", 20);
        Department rndDept = getOrCreateDepartment(org, "Research & Development", "RND", 35);

        // 4. Seed Representative Client Endpoints
        seedEndpoints(itDept, finDept, hrDept);

        // 5. Seed Default Classification Rules
        seedDefaultClassificationRules();

        // 6. Seed Default DLP Policies in SIMULATION mode
        seedDefaultPolicies();

        logger.info("IntelliDLP organization hierarchy & security policies ready.");
    }

    private Role getOrCreateRole(RoleType roleType, String description) {
        Optional<Role> existing = roleRepository.findByName(roleType);
        if (existing.isPresent()) {
            return existing.get();
        }
        Role role = new Role(null, roleType, description);
        return roleRepository.save(role);
    }

    private void getOrCreateUser(String username, String email, String rawPassword, String fullName, Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User(
                    null,
                    username,
                    email,
                    passwordEncoder.encode(rawPassword),
                    fullName,
                    UserStatus.ACTIVE,
                    Set.of(role)
            );
            userRepository.save(user);
        }
    }

    private Department getOrCreateDepartment(Organization org, String name, String code, int risk) {
        return departmentRepository.findByCode(code).orElseGet(() ->
                departmentRepository.save(new Department(null, org, name, code, risk))
        );
    }

    private void seedEndpoints(Department itDept, Department finDept, Department hrDept) {
        if (endpointRepository.count() == 0) {
            // Local Host Endpoint
            Endpoint localEndpoint = new Endpoint(
                    null,
                    "HOST-SECOPS-01",
                    "127.0.0.1",
                    "00:1A:2B:3C:4D:5E",
                    "Windows 11 Pro 23H2",
                    "v1.4.0",
                    EndpointStatus.ONLINE,
                    Instant.now()
            );
            localEndpoint.setDepartment(itDept);
            localEndpoint.setEmployeeName("SecOps Administrator");
            localEndpoint.setComplianceScore(98);
            localEndpoint.setApprovalStatus(DeviceApprovalStatus.APPROVED);
            localEndpoint = endpointRepository.save(localEndpoint);

            // Monitored Directories for Local Endpoint
            monitoredDirectoryRepository.save(new MonitoredDirectory(
                    null,
                    localEndpoint,
                    "C:\\IPS\\data_loss_prevention\\test-monitored-folders\\finance-drop",
                    true,
                    true
            ));
            monitoredDirectoryRepository.save(new MonitoredDirectory(
                    null,
                    localEndpoint,
                    "C:\\IPS\\data_loss_prevention\\test-monitored-folders\\hr-drop",
                    true,
                    true
            ));

            // Client Endpoint 2 (Finance Workstation)
            Endpoint finEndpoint = new Endpoint(
                    null,
                    "FINANCE-WS-04",
                    "192.168.1.104",
                    "00:50:56:C0:00:08",
                    "Windows 10 Enterprise",
                    "v1.4.0",
                    EndpointStatus.ONLINE,
                    Instant.now().minusSeconds(12)
            );
            finEndpoint.setDepartment(finDept);
            finEndpoint.setEmployeeName("Alice Vance (Accounts)");
            finEndpoint.setComplianceScore(92);
            finEndpoint.setApprovalStatus(DeviceApprovalStatus.APPROVED);
            endpointRepository.save(finEndpoint);

            // Client Endpoint 3 (HR Workstation - Pending Approval)
            Endpoint pendingEndpoint = new Endpoint(
                    null,
                    "HR-LAPTOP-12",
                    "192.168.1.112",
                    "B4:2E:99:A1:7B:44",
                    "macOS Sonoma 14.4",
                    "v1.4.0",
                    EndpointStatus.OFFLINE,
                    Instant.now().minusSeconds(180)
            );
            pendingEndpoint.setDepartment(hrDept);
            pendingEndpoint.setEmployeeName("Bob Jenkins (Talent)");
            pendingEndpoint.setComplianceScore(85);
            pendingEndpoint.setApprovalStatus(DeviceApprovalStatus.PENDING);
            endpointRepository.save(pendingEndpoint);
        }
    }

    private void seedDefaultClassificationRules() {
        if (classificationRuleRepository.count() == 0) {
            classificationRuleRepository.save(new ClassificationRule(
                    null,
                    "Restricted Financial & Identity Credentials",
                    ClassificationLevel.RESTRICTED,
                    "{\"types\": [\"AADHAAR\", \"CREDIT_CARD\", \"PRIVATE_KEY\", \"PASSWORD\"]}",
                    10,
                    true
            ));
            classificationRuleRepository.save(new ClassificationRule(
                    null,
                    "Confidential Tax & Access Secrets",
                    ClassificationLevel.CONFIDENTIAL,
                    "{\"types\": [\"PAN\", \"API_KEY\", \"BANK_ACCOUNT\"]}",
                    20,
                    true
            ));
            classificationRuleRepository.save(new ClassificationRule(
                    null,
                    "Internal PII & Communications",
                    ClassificationLevel.INTERNAL,
                    "{\"types\": [\"EMAIL\", \"PHONE\"]}",
                    30,
                    true
            ));
        }
    }

    private void seedDefaultPolicies() {
        if (dlpPolicyRepository.count() == 0) {
            dlpPolicyRepository.save(new DlpPolicy(
                    null,
                    "Block Restricted Financial & Identity Data Exfiltration",
                    "Simulated blocking of Aadhaar, Credit Card, and Private Keys detected on endpoints",
                    ClassificationLevel.RESTRICTED,
                    "FINANCIAL_IDENTITY",
                    PolicyAction.BLOCK,
                    true,
                    PolicySeverity.CRITICAL,
                    true
            ));

            dlpPolicyRepository.save(new DlpPolicy(
                    null,
                    "Warn on Cloud API Key & Secret Exposure",
                    "Warn analyst and user when unencrypted API keys or access tokens are saved in unapproved paths",
                    ClassificationLevel.CONFIDENTIAL,
                    "SECRETS_EXPOSURE",
                    PolicyAction.WARN,
                    true,
                    PolicySeverity.HIGH,
                    true
            ));

            dlpPolicyRepository.save(new DlpPolicy(
                    null,
                    "Require Approval for Bulk Internal PII Export",
                    "Require SOC Analyst sign-off if document contains high concentrations of email and phone records",
                    ClassificationLevel.INTERNAL,
                    "INTERNAL_PII",
                    PolicyAction.REQUIRE_APPROVAL,
                    true,
                    PolicySeverity.MEDIUM,
                    true
            ));
        }
    }
}
