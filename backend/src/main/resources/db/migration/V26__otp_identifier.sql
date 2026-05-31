-- OTP is now email-based (signup email verification), so generalise the column.
ALTER TABLE otp_codes RENAME COLUMN phone TO identifier;
ALTER TABLE otp_codes ALTER COLUMN identifier TYPE VARCHAR(255);
