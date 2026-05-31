package com.ecommerce.service;

import com.ecommerce.dto.request.AddAddressRequest;
import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.AdminUserResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest req) {
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getDob() != null) user.setDob(req.getDob());
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public List<Address> getAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    @Transactional
    public Address addAddress(User user, AddAddressRequest req) {
        if (req.isDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .ifPresent(a -> { a.setDefault(false); addressRepository.save(a); });
        }
        return addressRepository.save(Address.builder()
            .user(user).name(req.getName()).phone(req.getPhone())
            .line1(req.getLine1()).line2(req.getLine2())
            .city(req.getCity()).state(req.getState()).pincode(req.getPincode())
            .addressType(req.getAddressType()).isDefault(req.isDefault()).build());
    }

    @Transactional
    public Address updateAddress(Long addressId, UUID userId, AddAddressRequest req) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId)) throw new UnauthorizedException("Access denied");
        if (req.getName() != null) address.setName(req.getName());
        if (req.getPhone() != null) address.setPhone(req.getPhone());
        if (req.getLine1() != null) address.setLine1(req.getLine1());
        if (req.getCity() != null) address.setCity(req.getCity());
        if (req.getState() != null) address.setState(req.getState());
        if (req.getPincode() != null) address.setPincode(req.getPincode());
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, UUID userId) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId)) throw new UnauthorizedException("Access denied");
        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long addressId, UUID userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
            .ifPresent(a -> { a.setDefault(false); addressRepository.save(a); });
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId)) throw new UnauthorizedException("Access denied");
        address.setDefault(true);
        addressRepository.save(address);
    }

    public PagedResponse<AdminUserResponse> getAdminUsers(String search, String role, int page, int size) {
        Role roleEnum = role != null ? Role.valueOf(role) : null;
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PaginationUtils.toPagedResponse(
            userRepository.findAllWithFilters(search, roleEnum, pageable).map(this::toAdminUserResponse));
    }

    @Transactional
    public void toggleBlock(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);
    }

    @Transactional
    public void changeRole(UUID userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole(Role.valueOf(role));
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder().id(u.getId()).email(u.getEmail()).name(u.getName())
            .role(u.getRole().name()).profilePic(u.getProfilePic()).phone(u.getPhone())
            .gender(u.getGender()).dob(u.getDob()).isActive(u.isActive()).createdAt(u.getCreatedAt()).build();
    }

    private AdminUserResponse toAdminUserResponse(User u) {
        return AdminUserResponse.builder().id(u.getId()).email(u.getEmail()).name(u.getName())
            .role(u.getRole().name()).profilePic(u.getProfilePic()).phone(u.getPhone())
            .isActive(u.isActive()).isBlocked(u.isBlocked()).createdAt(u.getCreatedAt()).build();
    }
}
