CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    provider VARCHAR(20) NOT NULL DEFAULT 'RAZORPAY',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(512),
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(20),
    qr_code_url TEXT,
    refund_id VARCHAR(255),
    refunded_amount NUMERIC(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
