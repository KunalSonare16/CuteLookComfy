package com.ecommerce.security;

import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        processOAuth2User(oAuth2User);
        return oAuth2User;
    }

    private void processOAuth2User(OAuth2User oAuth2User) {
        Map<String, Object> attrs = oAuth2User.getAttributes();
        String email = (String) attrs.get("email");
        String name = (String) attrs.get("name");
        String googleId = (String) attrs.get("sub");
        String picture = (String) attrs.get("picture");

        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setName(name);
                user.setGoogleId(googleId);
                user.setProfilePic(picture);
                userRepository.save(user);
            },
            () -> userRepository.save(User.builder()
                .email(email)
                .name(name)
                .googleId(googleId)
                .profilePic(picture)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build())
        );
    }
}
