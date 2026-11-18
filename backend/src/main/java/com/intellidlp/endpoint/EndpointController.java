package com.intellidlp.endpoint;

import com.intellidlp.common.ApiResponse;
import com.intellidlp.policy.DlpPolicy;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/endpoints")
public class EndpointController {

    private final EndpointService endpointService;

    public EndpointController(EndpointService endpointService) {
        this.endpointService = endpointService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EndpointDto>>> getEndpoints() {
        return ResponseEntity.ok(ApiResponse.ok("Endpoints retrieved", endpointService.getAllEndpoints()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EndpointDto>> getEndpoint(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Endpoint detail", endpointService.getEndpointById(id)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<EndpointDto>> registerEndpoint(@Valid @RequestBody RegisterEndpointRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Registration received. Pending host administrator approval.", endpointService.registerEndpoint(request)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EndpointDto>> approveEndpoint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            HttpServletRequest request
    ) {
        String adminUser = currentUser != null ? currentUser.getUsername() : "ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.ok("Device approved", endpointService.approveEndpoint(id, adminUser, clientIp)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EndpointDto>> rejectEndpoint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            HttpServletRequest request
    ) {
        String adminUser = currentUser != null ? currentUser.getUsername() : "ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.ok("Device registration rejected", endpointService.rejectEndpoint(id, adminUser, clientIp)));
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EndpointDto>> suspendEndpoint(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            HttpServletRequest request
    ) {
        String adminUser = currentUser != null ? currentUser.getUsername() : "ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(ApiResponse.ok("Device status toggled", endpointService.suspendEndpoint(id, adminUser, clientIp)));
    }

    @PutMapping("/{id}/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EndpointDto>> assignDepartment(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body
    ) {
        UUID departmentId = body.get("departmentId");
        return ResponseEntity.ok(ApiResponse.ok("Department assigned", endpointService.assignDepartment(id, departmentId)));
    }

    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<ApiResponse<Void>> recordHeartbeat(
            @PathVariable UUID id,
            @RequestBody HeartbeatRequest request
    ) {
        endpointService.recordHeartbeat(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Heartbeat acknowledged", null));
    }

    @PostMapping("/{id}/commands")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<ApiResponse<RemoteCommand>> issueCommand(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String commandType = body.getOrDefault("commandType", "HEALTH_CHECK");
        String adminUser = currentUser != null ? currentUser.getUsername() : "ADMIN";
        return ResponseEntity.ok(ApiResponse.ok("Remote command queued", endpointService.issueCommand(id, commandType, adminUser)));
    }

    @GetMapping("/{id}/commands")
    public ResponseEntity<ApiResponse<List<RemoteCommand>>> getPendingCommands(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Pending commands", endpointService.getPendingCommands(id)));
    }

    @GetMapping("/{id}/policies")
    public ResponseEntity<ApiResponse<List<DlpPolicy>>> getEffectivePolicies(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Effective policies synchronized", endpointService.getEffectivePolicies(id)));
    }
}

