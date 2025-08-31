package com.github.zmancometh90.familyhub.models;

import java.util.UUID;

public class AdminPasswordChangeRequest {
    private String adminPassword;
    private UUID targetUserId;
    private String newPassword;

    public AdminPasswordChangeRequest() {}

    public AdminPasswordChangeRequest(String adminPassword, UUID targetUserId, String newPassword) {
        this.adminPassword = adminPassword;
        this.targetUserId = targetUserId;
        this.newPassword = newPassword;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(UUID targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}