CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    status VARCHAR(30) NOT NULL,
    changed_by_user_id UUID,
    note TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
