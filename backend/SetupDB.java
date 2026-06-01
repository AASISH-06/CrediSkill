package backend;

import java.io.File;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.Statement;

public class SetupDB {
    public static void main(String[] args) {
        System.out.println("Connecting to Database and executing schema.sql...");
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
            File file = new File("database/schema.sql");
            if (!file.exists()) {
                System.out.println("Cannot find database/schema.sql");
                return;
            }
            
            System.out.println("Dropping existing database for a clean slate...");
            stmt.execute("DROP DATABASE IF EXISTS crediskill_db");
            
            String content = new String(Files.readAllBytes(file.toPath()));
            // Split by semicolon, but this simple split might break if semicolons are inside strings
            // For a basic schema.sql it's usually fine
            String[] queries = content.split(";");
            
            for (String query : queries) {
                if (query.trim().isEmpty()) continue;
                System.out.println("Executing: " + query.substring(0, Math.min(query.length(), 50)).trim() + "...");
                stmt.execute(query.trim());
            }
            System.out.println("Database schema successfully applied!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
