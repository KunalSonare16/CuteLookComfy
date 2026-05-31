-- Available sizes per product, stored as a comma-separated list (e.g. "S,M,L,XL" or "5,6,7").
-- Admin enters the sizes when creating/updating a product; storefront shows a size selector.
ALTER TABLE products ADD COLUMN sizes VARCHAR(255);
