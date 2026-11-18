package com.intellidlp.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final Environment environment;

    @Value("${spring.application.name:intellidlp-backend}")
    private String applicationName;

    public HealthController(Environment environment) {
        this.environment = environment;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", applicationName);
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());
        status.put("javaVersion", System.getProperty("java.version"));
        status.put("activeProfiles", Arrays.asList(environment.getActiveProfiles()));
        status.put("maxMemoryMb", Runtime.getRuntime().maxMemory() / (1024 * 1024));
        status.put("freeMemoryMb", Runtime.getRuntime().freeMemory() / (1024 * 1024));
        status.put("totalMemoryMb", Runtime.getRuntime().totalMemory() / (1024 * 1024));

        return ResponseEntity.ok(ApiResponse.ok("IntelliDLP Backend is fully operational", status));
    }
}

