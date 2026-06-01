package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Job {
    private int jobId;
    private int clientId;
    private String title;
    private String description;
    private double budget;
    private String status;
    private String clientName; // Joined property

    public Job(int jobId, int clientId, String title, String description, double budget, String status, String clientName) {
        this.jobId = jobId;
        this.clientId = clientId;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.status = status;
        this.clientName = clientName;
    }

    public int getJobId() { return jobId; }
    public int getClientId() { return clientId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public double getBudget() { return budget; }
    public String getStatus() { return status; }
    public String getClientName() { return clientName; }

    public static boolean postJob(int clientId, String title, String description, double budget) {
        String query = "INSERT INTO Jobs (client_id, title, description, budget, status) VALUES (?, ?, ?, ?, 'OPEN')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, clientId);
            stmt.setString(2, title);
            stmt.setString(3, description);
            stmt.setDouble(4, budget);
            if (stmt.executeUpdate() > 0) {
                ActivityLog.logAction(clientId, "JOB_POSTED", "Posted a new job: " + title);
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<Job> getOpenJobs() {
        List<Job> jobs = new ArrayList<>();
        String query = "SELECT j.*, u.name as client_name FROM Jobs j JOIN Users u ON j.client_id = u.user_id WHERE j.status = 'OPEN' ORDER BY j.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                jobs.add(new Job(
                    rs.getInt("job_id"),
                    rs.getInt("client_id"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getDouble("budget"),
                    rs.getString("status"),
                    rs.getString("client_name")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return jobs;
    }
}
