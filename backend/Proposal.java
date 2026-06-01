package backend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Proposal {
    private int proposalId;
    private int jobId;
    private int freelancerId;
    private String coverLetter;
    private double bidAmount;
    private String status;
    private String freelancerName; // Joined property

    public Proposal(int proposalId, int jobId, int freelancerId, String coverLetter, double bidAmount, String status, String freelancerName) {
        this.proposalId = proposalId;
        this.jobId = jobId;
        this.freelancerId = freelancerId;
        this.coverLetter = coverLetter;
        this.bidAmount = bidAmount;
        this.status = status;
        this.freelancerName = freelancerName;
    }

    public int getProposalId() { return proposalId; }
    public int getJobId() { return jobId; }
    public int getFreelancerId() { return freelancerId; }
    public String getCoverLetter() { return coverLetter; }
    public double getBidAmount() { return bidAmount; }
    public String getStatus() { return status; }
    public String getFreelancerName() { return freelancerName; }

    public static boolean createProposal(int jobId, int freelancerId, String coverLetter, double bidAmount) {
        String query = "INSERT INTO Proposals (job_id, freelancer_id, cover_letter, bid_amount, status) VALUES (?, ?, ?, ?, 'PENDING')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, jobId);
            stmt.setInt(2, freelancerId);
            stmt.setString(3, coverLetter);
            stmt.setDouble(4, bidAmount);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static List<Proposal> getProposalsForJob(int jobId) {
        List<Proposal> proposals = new ArrayList<>();
        String query = "SELECT p.*, u.name as freelancer_name FROM Proposals p JOIN Users u ON p.freelancer_id = u.user_id WHERE p.job_id = ? ORDER BY p.bid_amount ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, jobId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    proposals.add(new Proposal(
                        rs.getInt("proposal_id"),
                        rs.getInt("job_id"),
                        rs.getInt("freelancer_id"),
                        rs.getString("cover_letter"),
                        rs.getDouble("bid_amount"),
                        rs.getString("status"),
                        rs.getString("freelancer_name")
                    ));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return proposals;
    }
}
