package backend;

import java.sql.Connection;
import java.sql.Statement;

public class FixDB {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            System.out.println("Trying to add csk_sequence...");
            try {
                stmt.executeUpdate("ALTER TABLE Users ADD COLUMN csk_sequence INT AUTO_INCREMENT UNIQUE");
                System.out.println("Successfully added csk_sequence as AUTO_INCREMENT.");
            } catch (Exception e) {
                System.out.println("Failed to add AUTO_INCREMENT: " + e.getMessage());
                // Fallback: Create sequence table and add csk_sequence as normal INT
                stmt.executeUpdate("CREATE TABLE IF NOT EXISTS CskSequenceTable (id INT AUTO_INCREMENT PRIMARY KEY)");
                stmt.executeUpdate("ALTER TABLE Users ADD COLUMN csk_sequence INT UNIQUE");
                System.out.println("Successfully created sequence table and csk_sequence column.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
