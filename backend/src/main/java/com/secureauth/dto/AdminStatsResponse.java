package com.secureauth.dto;

public class AdminStatsResponse {

    private long totalUsers;
    private long adminCount;
    private long userCount;

    public AdminStatsResponse(long totalUsers, long adminCount, long userCount) {
        this.totalUsers = totalUsers;
        this.adminCount = adminCount;
        this.userCount = userCount;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getAdminCount() { return adminCount; }
    public long getUserCount() { return userCount; }
}