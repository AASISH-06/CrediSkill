package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class Review {
    
    public static boolean addReview(int orderId, int reviewerId, int revieweeId, int skillId, int rating, String comment) {
        String query = "INSERT INTO Reviews (order_id, reviewer_id, reviewee_id, skill_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)";
        boolean isSuccess = false;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, orderId);
            stmt.setInt(2, reviewerId);
            stmt.setInt(3, revieweeId);
            stmt.setInt(4, skillId);
            stmt.setInt(5, rating);
            stmt.setString(6, comment);
            isSuccess = stmt.executeUpdate() > 0;
            
            if (isSuccess) {
                // Update credibility score for the person who received the review
                CredibilityScore.updateScore(revieweeId);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return isSuccess;
    }
}
