-- Selected size for an ordered item (e.g. "4-5 yrs", "M", "7"). Captured from the cart at checkout.
ALTER TABLE order_items ADD COLUMN size VARCHAR(50);
