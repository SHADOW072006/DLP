package com.intellidlp.user;

import com.intellidlp.audit.AuditLog;
import com.intellidlp.audit.AuditLogRepository;
import com.intellidlp.auth.UserProfileResponse;
import com.intellidlp.common.AppException;
import com.intellidlp.common.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuditLogRepository auditLogRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileResponse createUser(CreateUserRequest request, String adminUsername, String clientIp) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already in use: " + request.getEmail());
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRole()));

        User user = new User(
                null,
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                UserStatus.ACTIVE,
                Set.of(role)
        );

        User savedUser = userRepository.save(user);

        // Audit log
        User adminUser = userRepository.findByUsername(adminUsername).orElse(null);
        auditLogRepository.save(new AuditLog(
                null,
                adminUser,
                "USER_CREATED",
                "User:" + savedUser.getUsername(),
                clientIp,
                "SUCCESS",
                "Created user with role: " + role.getName()
        ));

        return mapToProfileResponse(savedUser);
    }

    @Transactional
    public UserProfileResponse updateUserStatus(UUID userId, UserStatus status, String adminUsername, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        User adminUser = userRepository.findByUsername(adminUsername).orElse(null);
        auditLogRepository.save(new AuditLog(
                null,
                adminUser,
                "USER_STATUS_UPDATED",
                "User:" + user.getUsername(),
                clientIp,
                "SUCCESS",
                "Updated status to: " + status
        ));

        return mapToProfileResponse(updatedUser);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getStatus().name(),
                roles,
                user.getCreatedAt()
        );
    }
}

