package com.ecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Provider-agnostic SMS sender.
 *  - Twilio: set SMS_PROVIDER=twilio + TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 *  - MSG91:  set SMS_PROVIDER=msg91  + MSG91_AUTH_KEY, MSG91_SENDER (DLT template required)
 *  - else:   "mock" — logs the OTP to the server console (dev). No real SMS sent.
 */
@Service
@Slf4j
public class SmsService {

    @Value("${sms.provider:mock}")        private String provider;
    @Value("${sms.twilio.sid:}")          private String twilioSid;
    @Value("${sms.twilio.token:}")        private String twilioToken;
    @Value("${sms.twilio.from:}")         private String twilioFrom;
    @Value("${sms.msg91.authkey:}")       private String msg91Key;
    @Value("${sms.msg91.sender:}")        private String msg91Sender;

    private final HttpClient http = HttpClient.newHttpClient();

    /** Returns true if a real SMS provider is configured (so the OTP should NOT be returned to the client). */
    public boolean isLive() {
        return "twilio".equalsIgnoreCase(provider) || "msg91".equalsIgnoreCase(provider);
    }

    public void sendOtp(String phone, String code) {
        String message = "Your CuteLookComfy verification code is " + code + ". It expires in 10 minutes.";
        try {
            switch (provider == null ? "mock" : provider.toLowerCase()) {
                case "twilio" -> sendTwilio(phone, message);
                case "msg91"  -> sendMsg91(phone, code);
                default       -> log.info("[MOCK SMS] to {}: {}", phone, message);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP SMS to {}: {}", phone, e.getMessage());
        }
    }

    private void sendTwilio(String to, String body) throws Exception {
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioSid + "/Messages.json";
        String form = "To=" + URLEncoder.encode(normalize(to), StandardCharsets.UTF_8)
            + "&From=" + URLEncoder.encode(twilioFrom, StandardCharsets.UTF_8)
            + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);
        String auth = Base64.getEncoder().encodeToString((twilioSid + ":" + twilioToken).getBytes(StandardCharsets.UTF_8));
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Basic " + auth)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(form))
            .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() >= 300) log.error("Twilio error {}: {}", res.statusCode(), res.body());
    }

    private void sendMsg91(String to, String code) throws Exception {
        // MSG91 OTP endpoint (requires DLT-approved template)
        String mobile = normalize(to).replace("+", "");
        String url = "https://control.msg91.com/api/v5/otp?otp=" + code
            + "&mobile=" + mobile + "&sender=" + msg91Sender;
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("authkey", msg91Key)
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() >= 300) log.error("MSG91 error {}: {}", res.statusCode(), res.body());
    }

    private String normalize(String phone) {
        String p = phone.replaceAll("[^0-9+]", "");
        if (!p.startsWith("+")) p = "+91" + p; // default to India
        return p;
    }
}
