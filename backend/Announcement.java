package backend;

import java.sql.Timestamp;

public class Announcement {
    private int announcementId;
    private String message;
    private Timestamp createdAt;

    public Announcement(int announcementId, String message, Timestamp createdAt) {
        this.announcementId = announcementId;
        this.message = message;
        this.createdAt = createdAt;
    }

    public int getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(int announcementId) { this.announcementId = announcementId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
