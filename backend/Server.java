package backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Server {

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        System.out.println("Starting CrediSkill server on port " + port);

        // Core API ends points
        server.createContext("/api/register", new RegisterHandler());
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/skills", new SkillsHandler());
        server.createContext("/api/orders", new OrdersHandler());
        server.createContext("/api/reviews", new ReviewsHandler());
        server.createContext("/api/credibility", new CredibilityHandler());
        server.createContext("/api/jobs", new JobsHandler());
        server.createContext("/api/proposals", new ProposalsHandler());
        server.createContext("/api/verify", new VerifyHandler());

        // Admin API endpoints
        server.createContext("/api/admin/login", new AdminAuthHandler());
        server.createContext("/api/admin/stats", new AdminStatsHandler());
        server.createContext("/api/admin/analytics", new AdminAnalyticsHandler());
        server.createContext("/api/admin/users", new AdminUserControlHandler());
        server.createContext("/api/admin/export/clients", new AdminExportHandler());
        server.createContext("/api/admin/export/freelancers", new AdminExportHandler());
        server.createContext("/api/admin/export/users", new AdminExportHandler());
        server.createContext("/api/admin/export/orders", new AdminExportHandler());
        server.createContext("/api/admin/announcements", new AnnouncementHandler());

        // Serve frontend files (basic static file server)
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null); // creates a default executor
        server.start();
    }

    // Utility to parse application/x-www-form-urlencoded
    public static Map<String, String> parseFormData(String formData) throws UnsupportedEncodingException {
        Map<String, String> map = new HashMap<>();
        if (formData == null || formData.isEmpty())
            return map;
        String[] pairs = formData.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=");
            if (kv.length > 1) {
                map.put(URLDecoder.decode(kv[0], "UTF-8"), URLDecoder.decode(kv[1], "UTF-8"));
            } else {
                map.put(URLDecoder.decode(kv[0], "UTF-8"), "");
            }
        }
        return map;
    }

    private static String getRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int len;
        while ((len = is.read(buffer)) != -1) {
            bos.write(buffer, 0, len);
        }
        return new String(bos.toByteArray(), StandardCharsets.UTF_8);
    }

    private static String escapeJson(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        // Handle CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);

                    String name = params.get("name");
                    String email = params.get("email");
                    String password = params.get("password");
                    String role = params.get("role");

                    String profileImageBase64 = params.get("profile_image");

                    if (name == null || email == null || password == null || name.trim().isEmpty()
                            || email.trim().isEmpty() || password.trim().isEmpty()) {
                        sendResponse(exchange, 400,
                                "{\"status\":\"error\", \"message\":\"Validation failed: missing fields required\"}");
                        return;
                    }

                    String result = User.register(name, email, password, role, profileImageBase64);

                    if ("SUCCESS".equals(result)) {
                        sendResponse(exchange, 200,
                                "{\"status\":\"success\", \"message\":\"Registration successful\"}");
                    } else if ("EMAIL_EXISTS".equals(result)) {
                        sendResponse(exchange, 400,
                                "{\"status\":\"error\", \"message\":\"Email already exists\"}");
                    } else {
                        sendResponse(exchange, 400,
                                "{\"status\":\"error\", \"message\":\"Registration failed. Please try again\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);

                    String email = params.get("email");
                    String password = params.get("password");

                    if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing credentials\"}");
                        return;
                    }

                    User user = User.login(email, password);

                    if (user != null) {
                        if (user.isSuspended()) {
                            sendResponse(exchange, 403, "{\"status\":\"error\", \"message\":\"Account is suspended\"}");
                            return;
                        }
                        if (!user.isEmailVerified()) {
                            sendResponse(exchange, 403, "{\"status\":\"error\", \"message\":\"Email not verified. Please verify your email to login.\"}");
                            return;
                        }
                        String json = String.format(
                                "{\"status\":\"success\", \"user_id\":%d, \"name\":\"%s\", \"role\":\"%s\", \"user_code\":\"%s\", \"profile_image\":\"%s\", \"email_verified\":%b, \"phone_verified\":%b, \"id_verified\":%b}",
                                user.getUserId(), escapeJson(user.getName()), escapeJson(user.getRole()), escapeJson(user.getUserCode()), escapeJson(user.getProfileImage()), user.isEmailVerified(), user.isPhoneVerified(), user.isIdVerified());
                        sendResponse(exchange, 200, json);
                    } else {
                        sendResponse(exchange, 401, "{\"status\":\"error\", \"message\":\"Invalid credentials\"}");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    static class SkillsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    List<Skill> skills = Skill.getMarketplaceSkills();
                    StringBuilder jsonBuilder = new StringBuilder("[");
                    for (int i = 0; i < skills.size(); i++) {
                        Skill s = skills.get(i);
                        jsonBuilder.append(String.format(
                                "{\"skill_id\":%d, \"user_id\":%d, \"title\":\"%s\", \"description\":\"%s\", \"price\":%.2f, \"author_name\":\"%s\"}",
                                s.getSkillId(), s.getUserId(), escapeJson(s.getTitle()), escapeJson(s.getDescription()),
                                s.getPrice(), escapeJson(s.getAuthorName())));
                        if (i < skills.size() - 1)
                            jsonBuilder.append(",");
                    }
                    jsonBuilder.append("]");
                    sendResponse(exchange, 200, jsonBuilder.toString());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);

                    if (!params.containsKey("user_id") || !params.containsKey("title")
                            || !params.containsKey("price")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing parameters\"}");
                        return;
                    }

                    boolean success = Skill.addSkill(
                            Integer.parseInt(params.get("user_id")),
                            params.get("title"),
                            params.getOrDefault("description", ""),
                            Double.parseDouble(params.get("price")),
                            params.getOrDefault("proof_url", ""));

                    if (success) {
                        sendResponse(exchange, 200, "{\"status\":\"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Failed to add skill\"}");
                    }
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
            }
        }
    }

    static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);

                    if (params.containsKey("action")) {
                        String action = params.get("action");
                        if ("accept".equals(action) && params.containsKey("order_id")) {
                            boolean success = Order.acceptOrder(Integer.parseInt(params.get("order_id")));
                            sendResponse(exchange, success ? 200 : 400, "{\"status\":\"" + (success ? "success" : "error") + "\"}");
                            return;
                        } else if ("complete".equals(action) && params.containsKey("order_id")) {
                            boolean success = Order.completeOrder(Integer.parseInt(params.get("order_id")));
                            sendResponse(exchange, success ? 200 : 400, "{\"status\":\"" + (success ? "success" : "error") + "\"}");
                            return;
                        }
                    }

                    if (!params.containsKey("client_id") || !params.containsKey("skill_id")
                            || !params.containsKey("freelancer_id")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing parameters\"}");
                        return;
                    }

                    boolean success = Order.createOrder(
                            Integer.parseInt(params.get("client_id")),
                            Integer.parseInt(params.get("skill_id")),
                            Integer.parseInt(params.get("freelancer_id")));
                    if (success) {
                        sendResponse(exchange, 200, "{\"status\":\"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Failed to order skill\"}");
                    }
                } else if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String query = exchange.getRequestURI().getQuery();
                    Map<String, String> params = parseFormData(query);

                    if (!params.containsKey("user_id") || !params.containsKey("role")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing user_id or role\"}");
                        return;
                    }

                    int userId = Integer.parseInt(params.get("user_id"));
                    String role = params.get("role");

                    List<Order> orders = Order.getOrdersByUser(userId, role);
                    StringBuilder json = new StringBuilder("[");
                    for (int i = 0; i < orders.size(); i++) {
                        Order o = orders.get(i);
                        json.append(String.format(
                                "{\"order_id\":%d, \"title\":\"%s\", \"price\":%.2f, \"status\":\"%s\"}",
                                o.getOrderId(), escapeJson(o.getTitle()), o.getPrice(), escapeJson(o.getStatus())));
                        if (i < orders.size() - 1)
                            json.append(",");
                    }
                    json.append("]");
                    sendResponse(exchange, 200, json.toString());
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
            }
        }
    }

    static class ReviewsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);

                    if (!params.containsKey("order_id") || !params.containsKey("reviewer_id")
                            || !params.containsKey("reviewee_id") || !params.containsKey("skill_id")
                            || !params.containsKey("rating")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing parameters\"}");
                        return;
                    }

                    boolean success = Review.addReview(
                            Integer.parseInt(params.get("order_id")),
                            Integer.parseInt(params.get("reviewer_id")),
                            Integer.parseInt(params.get("reviewee_id")),
                            Integer.parseInt(params.get("skill_id")),
                            Integer.parseInt(params.get("rating")),
                            params.getOrDefault("comment", ""));

                    if (success) {
                        // Order should already be completed by the freelancer. 
                        // Update credibility score for reviewee
                        CredibilityScore.updateScore(Integer.parseInt(params.get("reviewee_id")));
                        sendResponse(exchange, 200, "{\"status\":\"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Failed to add review\"}");
                    }
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
            }
        }
    }

    static class CredibilityHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String query = exchange.getRequestURI().getQuery();
                    Map<String, String> params = parseFormData(query);

                    if (!params.containsKey("user_id")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing user_id\"}");
                        return;
                    }

                    int userId = Integer.parseInt(params.get("user_id"));

                    CredibilityScore score = CredibilityScore.getScore(userId);
                    if (score != null) {
                        String json = String.format("{\"score\":%.2f, \"total_completed\":%d, \"average_rating\":%.2f}",
                                score.getScore(), score.getTotalCompletedServices(), score.getAverageRating());
                        sendResponse(exchange, 200, json);
                    } else {
                        sendResponse(exchange, 404, "{\"status\":\"not_found\"}");
                    }
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request format\"}");
            }
        }
    }

    static class JobsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    List<Job> jobs = Job.getOpenJobs();
                    StringBuilder jsonBuilder = new StringBuilder("[");
                    for (int i = 0; i < jobs.size(); i++) {
                        Job j = jobs.get(i);
                        jsonBuilder.append(String.format(
                                "{\"job_id\":%d, \"client_id\":%d, \"title\":\"%s\", \"description\":\"%s\", \"budget\":%.2f, \"status\":\"%s\", \"client_name\":\"%s\"}",
                                j.getJobId(), j.getClientId(), escapeJson(j.getTitle()), escapeJson(j.getDescription()),
                                j.getBudget(), escapeJson(j.getStatus()), escapeJson(j.getClientName())));
                        if (i < jobs.size() - 1)
                            jsonBuilder.append(",");
                    }
                    jsonBuilder.append("]");
                    sendResponse(exchange, 200, jsonBuilder.toString());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);
                    if (!params.containsKey("client_id") || !params.containsKey("title") || !params.containsKey("budget")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing parameters\"}");
                        return;
                    }
                    boolean success = Job.postJob(
                            Integer.parseInt(params.get("client_id")),
                            params.get("title"),
                            params.getOrDefault("description", ""),
                            Double.parseDouble(params.get("budget")));
                    sendResponse(exchange, success ? 200 : 400, "{\"status\":\"" + (success ? "success" : "error") + "\"}");
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request\"}");
            }
        }
    }

    static class ProposalsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String query = exchange.getRequestURI().getQuery();
                    Map<String, String> params = parseFormData(query);
                    if (!params.containsKey("job_id")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing job_id\"}");
                        return;
                    }
                    List<Proposal> proposals = Proposal.getProposalsForJob(Integer.parseInt(params.get("job_id")));
                    StringBuilder jsonBuilder = new StringBuilder("[");
                    for (int i = 0; i < proposals.size(); i++) {
                        Proposal p = proposals.get(i);
                        jsonBuilder.append(String.format(
                                "{\"proposal_id\":%d, \"job_id\":%d, \"freelancer_id\":%d, \"cover_letter\":\"%s\", \"bid_amount\":%.2f, \"status\":\"%s\", \"freelancer_name\":\"%s\"}",
                                p.getProposalId(), p.getJobId(), p.getFreelancerId(), escapeJson(p.getCoverLetter()),
                                p.getBidAmount(), escapeJson(p.getStatus()), escapeJson(p.getFreelancerName())));
                        if (i < proposals.size() - 1)
                            jsonBuilder.append(",");
                    }
                    jsonBuilder.append("]");
                    sendResponse(exchange, 200, jsonBuilder.toString());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);
                    if (!params.containsKey("job_id") || !params.containsKey("freelancer_id") || !params.containsKey("bid_amount")) {
                        sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Missing parameters\"}");
                        return;
                    }
                    boolean success = Proposal.createProposal(
                            Integer.parseInt(params.get("job_id")),
                            Integer.parseInt(params.get("freelancer_id")),
                            params.getOrDefault("cover_letter", ""),
                            Double.parseDouble(params.get("bid_amount")));
                    sendResponse(exchange, success ? 200 : 400, "{\"status\":\"" + (success ? "success" : "error") + "\"}");
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid request\"}");
            }
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }
            // Protect against directory traversal
            if (path.contains("..")) {
                exchange.sendResponseHeaders(403, -1);
                return;
            }

            File file = new File("frontend" + path);
            if (file.exists() && file.isFile()) {
                String contentType = "application/octet-stream";
                if (path.endsWith(".html"))
                    contentType = "text/html; charset=utf-8";
                else if (path.endsWith(".css"))
                    contentType = "text/css; charset=utf-8";
                else if (path.endsWith(".js"))
                    contentType = "application/javascript; charset=utf-8";
                else if (path.endsWith(".glb"))
                    contentType = "model/gltf-binary";
                else if (path.endsWith(".gltf"))
                    contentType = "model/gltf+json";
                else if (path.endsWith(".png"))
                    contentType = "image/png";
                else if (path.endsWith(".jpg") || path.endsWith(".jpeg"))
                    contentType = "image/jpeg";


                exchange.getResponseHeaders().add("Content-Type", contentType);
                exchange.sendResponseHeaders(200, file.length());
                try (OutputStream os = exchange.getResponseBody();
                        FileInputStream fs = new FileInputStream(file)) {
                    byte[] buffer = new byte[1024];
                    int count;
                    while ((count = fs.read(buffer)) != -1) {
                        os.write(buffer, 0, count);
                    }
                }
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
        }
    }

    static class AdminAuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);
                    String email = params.get("email");
                    String password = params.get("password");
                    String secret = params.get("secret_key");
                    
                    if ("admin@crediskill.com".equals(email) && "admin123".equals(password) && "CSK_SUPER_ADMIN_2026".equals(secret)) {
                        sendResponse(exchange, 200, "{\"status\":\"success\", \"message\":\"Admin authenticated\"}");
                    } else {
                        sendResponse(exchange, 401, "{\"status\":\"error\", \"message\":\"Invalid admin credentials\"}");
                    }
                } catch (Exception e) {
                    sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid format\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    static class AdminStatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                try (java.sql.Connection conn = DBConnection.getConnection();
                     java.sql.Statement stmt = conn.createStatement()) {
                     
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM Users");
                    rs.next(); int totalUsers = rs.getInt(1);
                    
                    rs = stmt.executeQuery("SELECT COUNT(*) FROM Users WHERE role='CLIENT' OR role='BOTH'");
                    rs.next(); int totalClients = rs.getInt(1);
                    
                    rs = stmt.executeQuery("SELECT COUNT(*) FROM Users WHERE role='FREELANCER' OR role='BOTH'");
                    rs.next(); int totalFreelancers = rs.getInt(1);
                    
                    rs = stmt.executeQuery("SELECT COUNT(*) FROM Orders");
                    rs.next(); int totalOrders = rs.getInt(1);

                    rs = stmt.executeQuery("SELECT COUNT(*) FROM Orders WHERE status='COMPLETED'");
                    rs.next(); int completedOrders = rs.getInt(1);
                    
                    rs = stmt.executeQuery("SELECT COUNT(*) FROM Jobs WHERE status='OPEN'");
                    rs.next(); int activeJobs = rs.getInt(1);
                    
                    rs = stmt.executeQuery("SELECT AVG(average_rating) FROM CredibilityScore WHERE average_rating > 0");
                    rs.next(); double averageRating = rs.getDouble(1);
                    
                    double health = Math.min(100, (totalUsers * 2.0) + completedOrders + (averageRating * 10));
                    
                    String json = String.format("{\"status\":\"success\", \"total_users\":%d, \"total_clients\":%d, \"total_freelancers\":%d, \"total_orders\":%d, \"active_jobs\":%d, \"platform_health\":%.1f}", 
                        totalUsers, totalClients, totalFreelancers, totalOrders, activeJobs, health);
                        
                    sendResponse(exchange, 200, json);
                } catch (Exception e) {
                    e.printStackTrace();
                    sendResponse(exchange, 500, "{\"status\":\"error\"}");
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    static class AdminAnalyticsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
             if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                 String json = "{\"status\":\"success\", \"user_growth\":[5, 12, 25, 45, 80], \"freelancer_progress\":[2, 8, 15, 22, 30], \"platform_activity\":[1, 5, 10, 15, 25], \"top_performers\":[{\"name\":\"Alice\", \"score\":95}, {\"name\":\"Bob\", \"score\":88}, {\"name\":\"Charlie\", \"score\":85}]}";
                 sendResponse(exchange, 200, json);
             } else {
                 exchange.sendResponseHeaders(405, -1);
             }
        }
    }

    static class AdminUserControlHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    StringBuilder json = new StringBuilder("[");
                    try (java.sql.Connection conn = DBConnection.getConnection();
                         java.sql.Statement stmt = conn.createStatement();
                         java.sql.ResultSet rs = stmt.executeQuery("SELECT * FROM Users")) {
                         boolean first = true;
                         while (rs.next()) {
                             if (!first) json.append(",");
                             
                             // Catch potentially missing columns for graceful backwards compat
                             boolean isAppr = false;
                             try { isAppr = rs.getBoolean("is_approved"); } catch(Exception e) {}
                             String pImg = null;
                             try { pImg = rs.getString("profile_image"); } catch (Exception e) {}

                             json.append(String.format("{\"user_id\":%d, \"user_code\":\"%s\", \"name\":\"%s\", \"email\":\"%s\", \"role\":\"%s\", \"is_suspended\":%b, \"email_verified\":%b, \"phone_verified\":%b, \"id_verified\":%b, \"is_approved\":%b, \"profile_image\":\"%s\"}",
                                 rs.getInt("user_id"), rs.getString("user_code"), escapeJson(rs.getString("name")), rs.getString("email"), rs.getString("role"), rs.getBoolean("is_suspended"), rs.getBoolean("email_verified"), rs.getBoolean("phone_verified"), rs.getBoolean("id_verified"), isAppr, escapeJson(pImg)));
                             first = false;
                         }
                    }
                    json.append("]");
                    sendResponse(exchange, 200, json.toString());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);
                    String action = params.get("action");
                    int userId = Integer.parseInt(params.get("user_id"));
                    
                    try (java.sql.Connection conn = DBConnection.getConnection();
                         java.sql.PreparedStatement stmt = conn.prepareStatement("UPDATE Users SET is_suspended = ? WHERE user_id = ?")) {
                         if ("suspend".equals(action)) {
                             stmt.setBoolean(1, true);
                             stmt.setInt(2, userId);
                             stmt.executeUpdate();
                         } else if ("unsuspend".equals(action)) {
                             stmt.setBoolean(1, false);
                             stmt.setInt(2, userId);
                             stmt.executeUpdate();
                         }
                         // Also support adding verification flags
                         if ("verify_email".equals(action)) {
                             stmt.clearParameters();
                             java.sql.PreparedStatement st2 = conn.prepareStatement("UPDATE Users SET email_verified = true WHERE user_id = ?");
                             st2.setInt(1, userId); st2.executeUpdate(); st2.close();
                         }
                         if ("verify_phone".equals(action)) {
                             stmt.clearParameters();
                             java.sql.PreparedStatement st2 = conn.prepareStatement("UPDATE Users SET phone_verified = true WHERE user_id = ?");
                             st2.setInt(1, userId); st2.executeUpdate(); st2.close();
                         }
                         if ("verify_id".equals(action)) {
                             stmt.clearParameters();
                             java.sql.PreparedStatement st2 = conn.prepareStatement("UPDATE Users SET id_verified = true WHERE user_id = ?");
                             st2.setInt(1, userId); st2.executeUpdate(); st2.close();
                         }
                         if ("approve".equals(action)) {
                             stmt.clearParameters();
                             java.sql.PreparedStatement st2 = conn.prepareStatement("UPDATE Users SET is_approved = true WHERE user_id = ?");
                             st2.setInt(1, userId); st2.executeUpdate(); st2.close();
                         }
                         if ("reject".equals(action)) {
                             stmt.clearParameters();
                             java.sql.PreparedStatement st2 = conn.prepareStatement("DELETE FROM Users WHERE user_id = ?");
                             st2.setInt(1, userId); st2.executeUpdate(); st2.close();
                         }
                    }
                    sendResponse(exchange, 200, "{\"status\":\"success\"}");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"status\":\"error\"}");
            }
        }
    }

    static class AdminExportHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            try (java.sql.Connection conn = DBConnection.getConnection();
                 java.sql.Statement stmt = conn.createStatement()) {
                 
                StringBuilder csv = new StringBuilder();
                if (path.endsWith("/clients")) {
                    csv.append("Name,CSK ID,Email,Role\n");
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT name, user_code, email, role FROM Users WHERE role='CLIENT' OR role='BOTH'");
                    while (rs.next()) {
                        csv.append(String.format("%s,%s,%s,%s\n", escapeCsv(rs.getString("name")), rs.getString("user_code"), rs.getString("email"), rs.getString("role")));
                    }
                } else if (path.endsWith("/freelancers")) {
                    csv.append("Name,CSK ID,Email,Role\n");
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT name, user_code, email, role FROM Users WHERE role='FREELANCER' OR role='BOTH'");
                    while (rs.next()) {
                        csv.append(String.format("%s,%s,%s,%s\n", escapeCsv(rs.getString("name")), rs.getString("user_code"), rs.getString("email"), rs.getString("role")));
                    }
                } else if (path.endsWith("/users")) {
                    csv.append("Name,CSK ID,Email,Role\n");
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT name, user_code, email, role FROM Users");
                    while (rs.next()) {
                        csv.append(String.format("%s,%s,%s,%s\n", escapeCsv(rs.getString("name")), rs.getString("user_code"), rs.getString("email"), rs.getString("role")));
                    }
                } else if (path.endsWith("/orders")) {
                    csv.append("Order ID,Client ID,Freelancer ID,Status\n");
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT order_id, client_id, freelancer_id, status FROM Orders");
                    while (rs.next()) {
                        csv.append(String.format("%d,%d,%d,%s\n", rs.getInt("order_id"), rs.getInt("client_id"), rs.getInt("freelancer_id"), rs.getString("status")));
                    }
                }
                
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Content-Type", "text/csv");
                exchange.getResponseHeaders().add("Content-Disposition", "attachment; filename=\"export.csv\"");
                byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(200, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"status\":\"error\"}");
            }
        }
        
        private String escapeCsv(String val) {
            if (val == null) return "";
            if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
                return "\"" + val.replace("\"", "\"\"") + "\"";
            }
            return val;
        }
    }

    static class AnnouncementHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    StringBuilder json = new StringBuilder("[");
                    try (java.sql.Connection conn = DBConnection.getConnection();
                         java.sql.Statement stmt = conn.createStatement();
                         java.sql.ResultSet rs = stmt.executeQuery("SELECT * FROM Announcements ORDER BY created_at DESC LIMIT 5")) {
                         boolean first = true;
                         while (rs.next()) {
                             if (!first) json.append(",");
                             json.append(String.format("{\"id\":%d, \"message\":\"%s\", \"created_at\":\"%s\"}",
                                 rs.getInt("announcement_id"), escapeJson(rs.getString("message")), rs.getTimestamp("created_at").toString()));
                             first = false;
                         }
                    }
                    json.append("]");
                    sendResponse(exchange, 200, json.toString());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = getRequestBody(exchange);
                    Map<String, String> params = parseFormData(body);
                    String msg = params.get("message");
                    
                    try (java.sql.Connection conn = DBConnection.getConnection();
                         java.sql.PreparedStatement stmt = conn.prepareStatement("INSERT INTO Announcements (message) VALUES (?)")) {
                         stmt.setString(1, msg);
                         stmt.executeUpdate();
                    }
                    sendResponse(exchange, 200, "{\"status\":\"success\"}");
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"status\":\"error\"}");
            }
        }
    }

    static class VerifyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = parseFormData(query);
                String token = params.get("token");

                if (token != null && User.verifyUserEmail(token)) {
                    String html = "<html><body style='font-family: sans-serif; text-align: center; padding-top: 50px; background: #0f172a; color: white;'>" +
                                  "<h1>Email Verified Successfully!</h1>" +
                                  "<p>You can now login to your account.</p>" +
                                  "<a href='/login.html' style='color: #38bdf8; text-decoration: none; border: 1px solid #38bdf8; padding: 10px 20px; border-radius: 5px;'>Go to Login</a>" +
                                  "</body></html>";
                    exchange.getResponseHeaders().add("Content-Type", "text/html");
                    byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
                    exchange.sendResponseHeaders(200, bytes.length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(bytes);
                    os.close();
                } else {
                    sendResponse(exchange, 400, "{\"status\":\"error\", \"message\":\"Invalid or expired verification token\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"status\":\"error\"}");
            }
        }
    }
}
