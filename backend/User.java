package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.SecureRandom;
import java.util.Base64;
import java.io.File;
import java.io.FileOutputStream;

public class User {
    private int userId;
    private String userCode;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private boolean phoneVerified;
    private boolean idVerified;
    private boolean isSuspended;
    private boolean isApproved;
    private String profileImage;
    private String verificationToken;

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public User(int userId, String userCode, String name, String email, String role, 
                boolean emailVerified, boolean phoneVerified, boolean idVerified, 
                boolean isSuspended, boolean isApproved, String profileImage, String verificationToken) {
        this.userId = userId;
        this.userCode = userCode;
        this.name = name;
        this.email = email;
        this.role = role;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
        this.idVerified = idVerified;
        this.isSuspended = isSuspended;
        this.isApproved = isApproved;
        this.profileImage = profileImage;
        this.verificationToken = verificationToken;
    }

    public int getUserId() { return userId; }
    public String getUserCode() { return userCode; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public boolean isIdVerified() { return idVerified; }
    public boolean isSuspended() { return isSuspended; }
    public boolean isApproved() { return isApproved; }
    public String getProfileImage() { return profileImage; }
    public String getVerificationToken() { return verificationToken; }

    private static String generateUniqueCode(Connection conn, String role) throws SQLException {
        String prefix = "BOTH";
        if ("CLIENT".equalsIgnoreCase(role)) prefix = "CLI";
        else if ("FREELANCER".equalsIgnoreCase(role)) prefix = "FREE";
        
        // Generate independent CSK sequence
        int cskSeq = 0;
        try (java.sql.Statement createStmt = conn.createStatement()) {
            createStmt.execute("CREATE TABLE IF NOT EXISTS CskSequenceTable (id INT AUTO_INCREMENT PRIMARY KEY)");
        }
        try (java.sql.PreparedStatement seqStmt = conn.prepareStatement(
                "INSERT INTO CskSequenceTable VALUES (null)", java.sql.Statement.RETURN_GENERATED_KEYS)) {
            seqStmt.executeUpdate();
            try (ResultSet rs = seqStmt.getGeneratedKeys()) {
                if (rs.next()) {
                    cskSeq = rs.getInt(1);
                }
            }
        }

        while (true) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(ALPHANUMERIC.charAt(SECURE_RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            String code = "CSK-" + cskSeq + "-" + prefix + "-" + sb.toString();
            
            try (PreparedStatement checkStmt = conn.prepareStatement("SELECT 1 FROM Users WHERE user_code = ?")) {
                checkStmt.setString(1, code);
                ResultSet rs = checkStmt.executeQuery();
                if (!rs.next()) {
                    return code; // unique!
                }
            }
        }
    }

    public static String register(String name, String email, String password, String role, String profileImageBase64) {
        try (Connection conn = DBConnection.getConnection()) {
            // Generate user code before insert to ensure it is never NULL
            String userCode = generateUniqueCode(conn, role);
            
            // Handle image saving
            String imagePath = null;
            if (profileImageBase64 != null && !profileImageBase64.trim().isEmpty()) {
                try {
                    // Assume data format: data:image/png;base64,iVBORw0KGgo...
                    String[] parts = profileImageBase64.split(",");
                    String imageString = parts.length > 1 ? parts[1] : parts[0];
                    byte[] imageBytes = Base64.getDecoder().decode(imageString);
                    
                    String ext = "jpg";
                    if (profileImageBase64.contains("image/png")) ext = "png";
                    
                    String fileName = userCode + "_profile." + ext;
                    String filePath = "frontend/uploads/profile/" + fileName;
                    
                    File file = new File(filePath);
                    file.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(imageBytes);
                    }
                    imagePath = "uploads/profile/" + fileName;
                } catch (Exception e) {
                    System.err.println("Failed to save profile image: " + e.getMessage());
                }
            }

            String verificationToken = java.util.UUID.randomUUID().toString();
            String insertQuery = "INSERT INTO Users (name, email, password, role, user_code, profile_image, is_approved, email_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery, java.sql.Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, name);
                stmt.setString(2, email);
                stmt.setString(3, password);
                stmt.setString(4, role);
                stmt.setString(5, userCode);
                stmt.setString(6, imagePath);
                stmt.setBoolean(7, true); // Auto-approved
                stmt.setBoolean(8, false); // Not verified yet
                stmt.setString(9, verificationToken);
                
                if (stmt.executeUpdate() > 0) {
                    try (ResultSet rs = stmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            int generatedId = rs.getInt(1);
                            CredibilityScore.initializeScore(generatedId);
                            ActivityLog.logAction(generatedId, "USER_REGISTER", "New user registered with role " + role);
                            
                            // Send verification email
                            EmailSender.sendVerificationEmail(email, name, verificationToken);
                            
                            return "SUCCESS";
                        }
                    }
                }
            }
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("duplicate entry")) {
                return "EMAIL_EXISTS";
            }
            e.printStackTrace();
        }
        return "ERROR";
    }

    public static User login(String email, String password) {
        String query = "SELECT * FROM Users WHERE email = ? AND password = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                // Check if the older columns existed or not
                boolean isAppr = false;
                try { isAppr = rs.getBoolean("is_approved"); } catch (Exception e) {}
                String pImg = null;
                try { pImg = rs.getString("profile_image"); } catch (Exception e) {}

                return new User(
                    rs.getInt("user_id"),
                    rs.getString("user_code"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("role"),
                    rs.getBoolean("email_verified"),
                    rs.getBoolean("phone_verified"),
                    rs.getBoolean("id_verified"),
                    rs.getBoolean("is_suspended"),
                    isAppr,
                    pImg,
                    rs.getString("verification_token")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static boolean verifyUserEmail(String token) {
        String query = "UPDATE Users SET email_verified = true, verification_token = NULL WHERE verification_token = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, token);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
