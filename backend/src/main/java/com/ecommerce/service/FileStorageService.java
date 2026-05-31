package com.ecommerce.service;

import com.ecommerce.exception.FileSizeLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Stores product/profile images.
 *  - In production: uploads to Supabase Storage (set SUPABASE_URL + SUPABASE_SERVICE_KEY).
 *  - In local dev: falls back to the local ./uploads folder served at /uploads/**.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String supabaseServiceKey;

    @Value("${supabase.bucket:product-images}")
    private String supabaseBucket;

    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private final HttpClient http = HttpClient.newHttpClient();

    private boolean useSupabase() {
        return supabaseUrl != null && !supabaseUrl.isBlank()
            && supabaseServiceKey != null && !supabaseServiceKey.isBlank();
    }

    public String storeFile(MultipartFile file) {
        if (file.getSize() > MAX_SIZE)
            throw new FileSizeLimitException("File size exceeds 5MB limit");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, WebP and GIF allowed");

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;

        if (useSupabase()) {
            return storeOnSupabase(file, filename);
        }
        return storeOnDisk(file, filename);
    }

    // Normalize the configured Supabase URL: trim trailing slashes and ensure a scheme,
    // so a value like "xxx.supabase.co" (no https://) doesn't blow up URI parsing.
    private String supabaseBase() {
        String base = supabaseUrl.trim().replaceAll("/+$", "");
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            base = "https://" + base;
        }
        return base;
    }

    private String storeOnSupabase(MultipartFile file, String filename) {
        try {
            String base = supabaseBase();
            String uploadUrl = base + "/storage/v1/object/" + supabaseBucket + "/" + filename;
            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + supabaseServiceKey)
                .header("apikey", supabaseServiceKey)
                .header("Content-Type", file.getContentType())
                .header("x-upsert", "true")
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() >= 200 && res.statusCode() < 300) {
                // public URL (bucket must be public)
                return base + "/storage/v1/object/public/" + supabaseBucket + "/" + filename;
            }
            throw new RuntimeException("Supabase upload failed (" + res.statusCode() + "): " + res.body());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("File storage failed: " + e.getMessage());
        }
    }

    private String storeOnDisk(MultipartFile file, String filename) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("File storage failed: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        // Supabase-hosted file
        if (fileUrl.startsWith("http") && fileUrl.contains("/storage/v1/object/")) {
            if (!useSupabase()) return;
            try {
                String base = supabaseBase();
                String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
                String delUrl = base + "/storage/v1/object/" + supabaseBucket + "/" + filename;
                HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(delUrl))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .header("apikey", supabaseServiceKey)
                    .DELETE()
                    .build();
                http.send(req, HttpResponse.BodyHandlers.discarding());
            } catch (Exception e) {
                log.warn("Failed to delete Supabase file: {}", fileUrl);
            }
            return;
        }
        // Local disk file
        if (!fileUrl.startsWith("/uploads/")) return;
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve(fileUrl.replace("/uploads/", ""));
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
