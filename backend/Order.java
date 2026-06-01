package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Order {
    private int orderId;
    private int clientId;
    private int skillId;
    private int freelancerId;
    private String status;
    private String title; // Join from Skill
    private double price; // Join from Skill
    
    public Order(int orderId, int clientId, int skillId, int freelancerId, String status, String title, double price) {
        this.orderId = orderId;
        this.clientId = clientId;
        this.skillId = skillId;
        this.freelancerId = freelancerId;
        this.status = status;
        this.title = title;
        this.price = price;
    }

    public int getOrderId() { return orderId; }
    public int getClientId() { return clientId; }
    public int getSkillId() { return skillId; }
    public int getFreelancerId() { return freelancerId; }
    public String getStatus() { return status; }
    public String getTitle() { return title; }
    public double getPrice() { return price; }

    public static boolean createOrder(int clientId, int skillId, int freelancerId) {
        String query = "INSERT INTO Orders (client_id, skill_id, freelancer_id, status) VALUES (?, ?, ?, 'PENDING')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, clientId);
            stmt.setInt(2, skillId);
            stmt.setInt(3, freelancerId);
            if (stmt.executeUpdate() > 0) {
                ActivityLog.logAction(clientId, "ORDER_CREATED", "Created a new order with freelancer " + freelancerId);
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean acceptOrder(int orderId) {
        String query = "UPDATE Orders SET status = 'IN_PROGRESS' WHERE order_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, orderId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean completeOrder(int orderId) {
        String query = "UPDATE Orders SET status = 'COMPLETED' WHERE order_id = ? AND status = 'IN_PROGRESS'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, orderId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // Get orders for a user (as client or freelancer)
    public static List<Order> getOrdersByUser(int userId, String roleFilter) {
        List<Order> orders = new ArrayList<>();
        String condition = roleFilter.equals("FREELANCER") ? "o.freelancer_id = ?" : "o.client_id = ?";
        String query = "SELECT o.order_id, o.client_id, o.skill_id, o.freelancer_id, o.status, s.title, s.price " +
                       "FROM Orders o JOIN Skills s ON o.skill_id = s.skill_id WHERE " + condition + " ORDER BY o.order_date DESC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    orders.add(new Order(
                        rs.getInt("order_id"),
                        rs.getInt("client_id"),
                        rs.getInt("skill_id"),
                        rs.getInt("freelancer_id"),
                        rs.getString("status"),
                        rs.getString("title"),
                        rs.getDouble("price")
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return orders;
    }
}
