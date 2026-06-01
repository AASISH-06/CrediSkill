package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CredibilityScore {
    private int userId;
    private double score;
    private int totalCompletedServices;
    private double averageRating;

    public CredibilityScore(int userId, double score, int totalCompletedServices, double averageRating) {
        this.userId = userId;
        this.score = score;
        this.totalCompletedServices = totalCompletedServices;
        this.averageRating = averageRating;
    }

    public int getUserId() { return userId; }
    public double getScore() { return score; }
    public int getTotalCompletedServices() { return totalCompletedServices; }
    public double getAverageRating() { return averageRating; }
    
    public static void initializeScore(int userId) {
        String query = "INSERT IGNORE INTO CredibilityScore (user_id, score, total_completed_services, average_rating) VALUES (?, 0, 0, 0)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static boolean updateScore(int userId) {
        int totalCompleted = 0;
        double avgRating = 0.0;
        
        String countQuery = "SELECT COUNT(*) FROM Orders WHERE freelancer_id = ? AND status = 'COMPLETED'";
        String avgQuery = "SELECT AVG(rating) FROM Reviews WHERE reviewee_id = ?";

        try (Connection conn = DBConnection.getConnection()) {
            
            try (PreparedStatement countStmt = conn.prepareStatement(countQuery)) {
                countStmt.setInt(1, userId);
                try (ResultSet rs = countStmt.executeQuery()) {
                    if (rs.next()) totalCompleted = rs.getInt(1);
                }
            }

            try (PreparedStatement avgStmt = conn.prepareStatement(avgQuery)) {
                avgStmt.setInt(1, userId);
                try (ResultSet rs = avgStmt.executeQuery()) {
                    if (rs.next()) avgRating = rs.getDouble(1);
                }
            }
            
            // Formula: Base calculation
            double credibilityScore = (avgRating * 10) + (totalCompleted * 2);
            if (credibilityScore > 100) credibilityScore = 100.0; // Max score 100

            // Update
            String updateQuery = "UPDATE CredibilityScore SET score = ?, total_completed_services = ?, average_rating = ? WHERE user_id = ?";
            try (PreparedStatement updateStmt = conn.prepareStatement(updateQuery)) {
                updateStmt.setDouble(1, credibilityScore);
                updateStmt.setInt(2, totalCompleted);
                updateStmt.setDouble(3, avgRating);
                updateStmt.setInt(4, userId);
                return updateStmt.executeUpdate() > 0;
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public static CredibilityScore getScore(int userId) {
        String query = "SELECT * FROM CredibilityScore WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new CredibilityScore(
                        rs.getInt("user_id"),
                        rs.getDouble("score"),
                        rs.getInt("total_completed_services"),
                        rs.getDouble("average_rating")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
