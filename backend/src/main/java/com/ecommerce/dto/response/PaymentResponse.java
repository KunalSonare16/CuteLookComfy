package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String status;
    private BigDecimal amount;
    private String method;
    private String qrCodeUrl;
    private BigDecimal refundedAmount;
    private String keyId;
}
