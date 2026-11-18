package com.intellidlp.user;

import com.intellidlp.auth.UserProfileResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Create new user with ROLE_ANALYST and verify persistence")
    void createNewUser() {
        CreateUserRequest req = new CreateUserRequest(
                "sarah_analyst",
                "sarah@intellidlp.local",
                "SecretPass123!",
                "Sarah Connor",
                RoleType.ROLE_ANALYST
        );

        UserProfileResponse created = userService.createUser(req, "admin", "127.0.0.1");

        assertNotNull(created.getId());
        assertEquals("sarah_analyst", created.getUsername());
        assertEquals("Sarah Connor", created.getFullName());
        assertTrue(created.getRoles().contains("ROLE_ANALYST"));
        assertEquals("ACTIVE", created.getStatus());

        assertTrue(userRepository.existsByUsername("sarah_analyst"));
    }

    @Test
    @DisplayName("Update user status to SUSPENDED")
    void updateUserStatus() {
        CreateUserRequest req = new CreateUserRequest(
                "temp_user",
                "temp@intellidlp.local",
                "SecretPass123!",
                "Temp User",
                RoleType.ROLE_USER
        );

        UserProfileResponse created = userService.createUser(req, "admin", "127.0.0.1");
        UserProfileResponse updated = userService.updateUserStatus(created.getId(), UserStatus.SUSPENDED, "admin", "127.0.0.1");

        assertEquals("SUSPENDED", updated.getStatus());
    }
}

