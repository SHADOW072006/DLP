package com.intellidlp.organization;

import java.time.Instant;
import java.util.UUID;

public class OrganizationDto {

    private UUID id;
    private String name;
    private String code;
    private String contactEmail;
    private Instant createdAt;
    private int departmentCount;

    public OrganizationDto() {
    }

    public OrganizationDto(UUID id, String name, String code, String contactEmail, Instant createdAt, int departmentCount) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.contactEmail = contactEmail;
        this.createdAt = createdAt;
        this.departmentCount = departmentCount;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public int getDepartmentCount() {
        return departmentCount;
    }

    public void setDepartmentCount(int departmentCount) {
        this.departmentCount = departmentCount;
    }
}

