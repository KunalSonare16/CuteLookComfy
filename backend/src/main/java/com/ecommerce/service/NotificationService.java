package com.ecommerce.service;

import com.ecommerce.dto.response.NotificationResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.entity.Notification;
import com.ecommerce.enums.NotificationType;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.NotificationRepository;
import com.ecommerce.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Async
    public void create(UUID userId, NotificationType type, String title, String message, Map<String, Object> data) {
        Notification notification = Notification.builder()
            .userId(userId).type(type).title(title).message(message).data(data)
            .isRead(false).build();
        notificationRepository.save(notification);
    }

    public PagedResponse<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        return PaginationUtils.toPagedResponse(
            notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Transactional
    public void markRead(Long id, UUID userId) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!n.getUserId().equals(userId)) throw new ResourceNotFoundException("Notification", "id", id);
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId()).type(n.getType().name()).title(n.getTitle())
            .message(n.getMessage()).data(n.getData()).isRead(n.isRead())
            .createdAt(n.getCreatedAt()).build();
    }
}
