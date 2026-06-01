package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Skill {
    private int skillId;
    private int userId;
    private String title;
    private String description;
    private double price;
    private String authorName; // For UI display

    public Skill(int skillId, int userId, String title, String description, double price, String authorName) {
        this.skillId = skillId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.price = price;
        this.authorName = authorName;
    }

    public int getSkillId() { return skillId; }
    public int getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public String getAuthorName() { return authorName; }

    public static boolean addSkill(int userId, String title, String description, double price, String proofUrl) {
        String query = "INSERT INTO Skills (user_id, title, description, price) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, userId);
            stmt.setString(2, title);
            stmt.setString(3, description);
            stmt.setDouble(4, price);
            if (stmt.executeUpdate() > 0) {
                if (proofUrl != null && !proofUrl.trim().isEmpty()) {
                    try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            int skillId = generatedKeys.getInt(1);
                            String proofQuery = "INSERT INTO SkillProof (skill_id, proof_url) VALUES (?, ?)";
                            try (PreparedStatement proofStmt = conn.prepareStatement(proofQuery)) {
                                proofStmt.setInt(1, skillId);
                                proofStmt.setString(2, proofUrl);
                                proofStmt.executeUpdate();
                                // Reward credibility score for adding proof
                                CredibilityScore.updateScore(userId); 
                            }
                        }
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<Skill> getMarketplaceSkills() {
        List<Skill> skills = new ArrayList<>();
        String query = "SELECT s.skill_id, s.user_id, s.title, s.description, s.price, u.name as author_name, COALESCE(cs.score, 0) as credibility_score " +
                       "FROM Skills s JOIN Users u ON s.user_id = u.user_id " +
                       "LEFT JOIN CredibilityScore cs ON s.user_id = cs.user_id " +
                       "ORDER BY credibility_score DESC, s.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                skills.add(new Skill(
                    rs.getInt("skill_id"),
                    rs.getInt("user_id"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getDouble("price"),
                    rs.getString("author_name")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return skills;
    }
}
