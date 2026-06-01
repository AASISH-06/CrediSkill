package backend;

import java.sql.Connection;
import java.sql.Statement;

public class FixDBv2 {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Adding profile_image...");
            try {
                stmt.executeUpdate("ALTER TABLE Users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL");
            } catch (Exception e) {
                System.out.println("profile_image might already exist: " + e.getMessage());
            }

            System.out.println("Adding is_approved...");
            try {
                stmt.executeUpdate("ALTER TABLE Users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE");
                // Approve existing users so admin doesn't get locked out
                stmt.executeUpdate("UPDATE Users SET is_approved = TRUE");
            } catch (Exception e) {
                System.out.println("is_approved might already exist: " + e.getMessage());
            }
            
            System.out.println("Done DB migrations.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
