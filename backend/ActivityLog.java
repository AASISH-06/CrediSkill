package backend;

import java.sql.Timestamp;

public class ActivityLog {
    private int logId;
    private int userId;
    private String actionType;
    private String description;
    private Timestamp createdAt;

    public ActivityLog(int logId, int userId, String actionType, String description, Timestamp createdAt) {
        this.logId = logId;
        this.userId = userId;
        this.actionType = actionType;
        this.description = description;
        this.createdAt = createdAt;
    }

    public int getLogId() { return logId; }
    public void setLogId(int logId) { this.logId = logId; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public static void logAction(int userId, String action, String description) {
        String query = "INSERT INTO ActivityLogs (user_id, action_type, description) VALUES (?, ?, ?)";
        try (java.sql.Connection conn = DBConnection.getConnection();
             java.sql.PreparedStatement stmt = conn.prepareStatement(query)) {
             stmt.setInt(1, userId);
             stmt.setString(2, action);
             stmt.setString(3, description);
             stmt.executeUpdate();
        } catch (Exception e) {
             e.printStackTrace();
        }
    }
}
