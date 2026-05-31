package com.ecommerce.service;

import com.ecommerce.entity.NewsletterSubscriber;
import com.ecommerce.repository.NewsletterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;

    @Transactional
    public void subscribe(String email) {
        newsletterRepository.findByEmail(email).ifPresentOrElse(
            s -> { s.setActive(true); newsletterRepository.save(s); },
            () -> newsletterRepository.save(NewsletterSubscriber.builder()
                .email(email).isActive(true).build())
        );
    }
}
