CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(100) NOT NULL,
    price_override NUMERIC(10,2),
    stock_qty INT DEFAULT 0,
    sku VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);
