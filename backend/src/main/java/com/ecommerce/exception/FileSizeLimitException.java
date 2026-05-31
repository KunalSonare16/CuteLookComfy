package com.ecommerce.exception;

public class FileSizeLimitException extends RuntimeException {
    public FileSizeLimitException(String message) {
        super(message);
    }
}
