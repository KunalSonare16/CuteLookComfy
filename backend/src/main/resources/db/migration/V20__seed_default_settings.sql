INSERT INTO settings (key, value) VALUES
('store_name', 'MyStore'),
('store_email', 'store@example.com'),
('store_phone', '+91 9999999999'),
('store_address', '123 Main Street, City, State - 400001'),
('currency', 'INR'),
('currency_symbol', '₹'),
('gstin', '22AAAAA0000A1Z5'),
('shipping_charge', '50'),
('free_shipping_above', '500'),
('order_cancellation_window_minutes', '60'),
('return_window_days', '7'),
('maintenance_mode', 'false'),
('razorpay_enabled', 'true'),
('cod_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
