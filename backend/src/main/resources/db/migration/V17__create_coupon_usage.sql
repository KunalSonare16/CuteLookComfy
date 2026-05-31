CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id),
    user_id UUID NOT NULL,
    order_id UUID,
    used_at TIMESTAMP NOT NULL DEFAULT NOW()
);
