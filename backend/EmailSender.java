package backend;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;

public class EmailSender {

    // IMPORTANT: Provide your actual Gmail address and the 16-character App Password here
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "465"; // Using 465 for SSL (more reliable)
    private static final String SENDER_EMAIL = "aasishlebaka74@gmail.com";
    private static final String APP_PASSWORD = "dfdg vsvo hwmi zlon";

    public static void sendVerificationEmail(String toEmail, String name, String token) {
        String verificationLink = "http://localhost:8080/api/verify?token=" + token;
        String subject = "Verify your CrediSkill Account";
        String body = "Welcome to CrediSkill, " + name + "!\n\n" +
                      "Please click the link below to verify your account and start using the platform:\n" +
                      verificationLink + "\n\n" +
                      "If you did not register for this account, please ignore this email.";
        
        sendEmail(toEmail, subject, body);
    }

    public static void sendRegistrationEmail(String toEmail, String name) {
        String subject = "CrediSkill Account Created";
        String body = "Welcome to CrediSkill, " + name + "!\nYour account has been successfully created.";
        sendEmail(toEmail, subject, body);
    }

    private static void sendEmail(String toEmail, String subject, String content) {
        new Thread(() -> {
            try {
                Properties props = new Properties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.host", SMTP_HOST);
                props.put("mail.smtp.port", SMTP_PORT);
                props.put("mail.smtp.socketFactory.port", SMTP_PORT);
                props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.connectiontimeout", "10000");
                props.put("mail.smtp.timeout", "10000");
                props.put("mail.smtp.writetimeout", "10000");

                Session session = Session.getInstance(props, new Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(SENDER_EMAIL, APP_PASSWORD);
                    }
                });

                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress(SENDER_EMAIL, "CrediSkill Admin"));
                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
                message.setSubject(subject);
                message.setText(content);

                Transport.send(message);
                System.out.println("Email sent successfully to " + toEmail);
            } catch (AuthenticationFailedException e) {
                System.err.println("Email Authentication Failed. Please verify App Password in EmailSender.java");
            } catch (MessagingException e) {
                String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                if (errorMsg.contains("timeout") || errorMsg.contains("connect")) {
                    System.err.println("Email service temporarily unavailable (Network/Firewall restriction)");
                } else {
                    System.err.println("Failed to send email via SMTP: " + e.getMessage());
                }
            } catch (Exception e) {
                System.err.println("Unexpected Email Error: " + e.getMessage());
            }
        }).start();
    }
}
