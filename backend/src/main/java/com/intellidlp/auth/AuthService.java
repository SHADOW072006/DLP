package com.intellidlp.auth;

import com.intellidlp.audit.AuditLog;
import com.intellidlp.audit.AuditLogRepository;
import com.intellidlp.common.AppException;
import com.intellidlp.common.ResourceNotFoundException;
import com.intellidlp.security.JwtTokenProvider;
import com.intellidlp.security.UserPrincipal;
import com.intellidlp.user.Role;
import com.intellidlp.user.User;
import com.intellidlp.user.UserRepository;
import com.intellidlp.user.UserStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, String clientIp) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername().trim(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getUsername());

            List<String> roles = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Record successful login audit log
            User user = userRepository.findByUsername(userPrincipal.getUsername()).orElse(null);
            AuditLog auditLog = new AuditLog(
                    null,
                    user,
                    "LOGIN_SUCCESS",
                    "AUTH_SYSTEM",
                    clientIp,
                    "SUCCESS",
                    "User successfully authenticated via JWT"
            );
            auditLogRepository.save(auditLog);

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    userPrincipal.getUsername(),
                    userPrincipal.getFullName(),
                    roles,
                    tokenProvider.getExpirationMs()
            );
        } catch (BadCredentialsException ex) {
            // Record failed attempt
            AuditLog failLog = new AuditLog(
                    null,
                    null,
                    "LOGIN_FAILED",
                    "AUTH_SYSTEM",
                    clientIp,
                    "FAILURE",
                    "Invalid credentials provided for user: " + loginRequest.getUsername()
            );
            auditLogRepository.save(failLog);
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new AppException("Invalid or expired refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException("Account is not active: " + user.getStatus());
        }

        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String newAccessToken = tokenProvider.generateAccessToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(username);

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                user.getUsername(),
                user.getFullName(),
                roles,
                tokenProvider.getExpirationMs()
        );
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AppException("No authenticated user session found");
        }

        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", principal.getUsername()));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .map(Enum::name)
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

    @Transactional
    public void logout(String clientIp) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            User user = userRepository.findByUsername(principal.getUsername()).orElse(null);
            AuditLog auditLog = new AuditLog(
                    null,
                    user,
                    "LOGOUT",
                    "AUTH_SYSTEM",
                    clientIp,
                    "SUCCESS",
                    "User logged out"
            );
            auditLogRepository.save(auditLog);
        }
        SecurityContextHolder.clearContext();
    }
}

