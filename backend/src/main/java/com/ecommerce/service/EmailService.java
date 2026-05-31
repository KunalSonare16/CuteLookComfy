package com.ecommerce.service;

import com.ecommerce.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    // NOTE: these are intentionally synchronous. They access lazy order.user within
    // the caller's transaction/session; running them @Async on another thread would
    // touch the still-committing Hibernate session concurrently and corrupt it.
    public void sendOrderConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Confirmed - #" + order.getId().toString().substring(0, 8).toUpperCase(),
            "email/order-placed", buildOrderContext(order));
    }

    public void sendOrderShipped(Order order) {
        sendEmail(order.getUser().getEmail(), "Your Order Has Been Shipped!",
            "email/order-shipped", buildOrderContext(order));
    }

    public void sendOrderDelivered(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Delivered - How was it?",
            "email/order-delivered", buildOrderContext(order));
    }

    public void sendOrderCancelled(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Cancelled - #" + order.getId().toString().substring(0, 8).toUpperCase(),
            "email/order-cancelled", buildOrderContext(order));
    }

    public void sendRefundConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Refund Initiated",
            "email/refund-initiated", buildOrderContext(order));
    }

    public void sendReturnConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Return Request Received",
            "email/return-received", buildOrderContext(order));
    }

    public void sendOtp(String to, String code) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;text-align:center'>"
            + "<h2 style='color:#E8242A'>Verify your phone number</h2>"
            + "<p>Use this code to verify your phone on CuteLookComfy. It expires in 10 minutes.</p>"
            + "<div style='font-size:34px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#111'>" + code + "</div>"
            + "<p style='color:#888;font-size:13px'>If you didn't request this, you can ignore this email.</p>"
            + "</div>";
        sendHtmlEmail(to, "Your CuteLookComfy verification code", html);
    }

    @Async
    public void sendPasswordReset(String to, String resetLink) {
        String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto'>"
            + "<h2 style='color:#E8242A'>Reset Your Password</h2>"
            + "<p>We received a request to reset your CuteLookComfy password. Click the button below to choose a new one. This link expires in 1 hour.</p>"
            + "<p><a href='" + resetLink + "' style='display:inline-block;padding:12px 28px;background:#E8242A;color:#fff;text-decoration:none;font-weight:600'>Reset Password</a></p>"
            + "<p style='color:#888;font-size:13px'>If you didn't request this, you can safely ignore this email.</p>"
            + "</div>";
        sendHtmlEmail(to, "Reset Your CuteLookComfy Password", html);
    }

    @Async
    public void sendContactMessage(String supportInbox, String fromName, String fromEmail, String subject, String message) {
        String html = "<div style='font-family:sans-serif'>"
            + "<h3>New Contact Message</h3>"
            + "<p><strong>From:</strong> " + escape(fromName) + " (" + escape(fromEmail) + ")</p>"
            + "<p><strong>Subject:</strong> " + escape(subject) + "</p>"
            + "<p><strong>Message:</strong></p>"
            + "<p style='white-space:pre-wrap'>" + escape(message) + "</p>"
            + "</div>";
        sendHtmlEmail(supportInbox, "Contact Form: " + subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private void sendEmail(String to, String subject, String template, Context ctx) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(templateEngine.process(template, ctx), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private Context buildOrderContext(Order order) {
        Context ctx = new Context();
        ctx.setVariable("order", order);
        ctx.setVariable("customerName", order.getUser().getName());
        return ctx;
    }
}
