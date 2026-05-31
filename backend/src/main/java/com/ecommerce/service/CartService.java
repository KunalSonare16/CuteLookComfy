package com.ecommerce.service;

import com.ecommerce.dto.request.AddToCartRequest;
import com.ecommerce.dto.request.CartSyncRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductVariant;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ProductVariantRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CartService {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CouponService couponService;

    // Fallback in-memory store when Redis is unavailable
    private final Map<String, Object> inMemoryStore = new ConcurrentHashMap<>();

    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL_DAYS = 30;

    public CartService(ProductRepository productRepository,
                       ProductVariantRepository variantRepository,
                       CouponService couponService) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.couponService = couponService;
    }

    @SuppressWarnings("unchecked")
    public CartResponse getCart(UUID userId) {
        String key = cartKey(userId);
        Map<String, Object> cartData = (Map<String, Object>) storeGet(key);
        if (cartData == null) {
            return emptyCart();
        }
        return buildCartResponse(cartData);
    }

    public CartResponse addItem(UUID userId, AddToCartRequest req) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(req.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", req.getProductId()));

        if (!product.isActive()) throw new ResourceNotFoundException("Product", "id", req.getProductId());

        int available = product.getStockQty();
        BigDecimal price = product.getSellingPrice();
        String variantLabel = null;

        if (req.getVariantId() != null) {
            ProductVariant variant = variantRepository.findById(req.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", req.getVariantId()));
            available = variant.getStockQty();
            if (variant.getPriceOverride() != null) price = variant.getPriceOverride();
            variantLabel = variant.getAttributeName() + ": " + variant.getAttributeValue();
        }

        // Fold the chosen size into the display label (admin-defined simple sizes, e.g. "4-5 yrs")
        String size = req.getSize() != null && !req.getSize().isBlank() ? req.getSize().trim() : null;
        if (size != null) {
            variantLabel = (variantLabel != null ? variantLabel + ", " : "") + "Size: " + size;
        }

        Map<String, Object> cartData = getOrCreateCartData(userId);
        List<Map<String, Object>> items = getItems(cartData);

        String itemKey = req.getProductId().toString()
            + (req.getVariantId() != null ? ":" + req.getVariantId() : "")
            + (size != null ? ":" + size : "");
        Optional<Map<String, Object>> existing = items.stream()
            .filter(i -> itemKey.equals(i.get("itemKey"))).findFirst();

        int newQty = req.getQty();
        if (existing.isPresent()) {
            newQty += (int) existing.get().get("qty");
        }

        if (!product.isAllowBackorders() && newQty > available) {
            throw new InsufficientStockException("Only " + available + " items in stock");
        }

        if (existing.isPresent()) {
            existing.get().put("qty", newQty);
            existing.get().put("totalPrice", price.multiply(BigDecimal.valueOf(newQty)));
        } else {
            String featuredImg = product.getImages().stream()
                .filter(img -> img.isFeatured()).findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(img -> img.getImageUrl()).orElse(null);

            Map<String, Object> newItem = new HashMap<>();
            newItem.put("itemKey", itemKey);
            newItem.put("productId", req.getProductId().toString());
            newItem.put("variantId", req.getVariantId());
            newItem.put("productName", product.getName());
            newItem.put("productImage", featuredImg);
            newItem.put("slug", product.getSlug());
            newItem.put("unitPrice", price);
            newItem.put("qty", newQty);
            newItem.put("totalPrice", price.multiply(BigDecimal.valueOf(newQty)));
            newItem.put("stockQty", available);
            newItem.put("variantLabel", variantLabel);
            newItem.put("size", size);
            items.add(newItem);
        }

        cartData.put("items", items);
        saveCart(userId, cartData);
        return buildCartResponse(cartData);
    }

    public CartResponse updateItem(UUID userId, UUID productId, int qty) {
        if (qty <= 0) return removeItem(userId, productId);
        Map<String, Object> cartData = getOrCreateCartData(userId);
        List<Map<String, Object>> items = getItems(cartData);
        items.stream()
            .filter(i -> i.get("productId").toString().equals(productId.toString()))
            .findFirst().ifPresent(item -> {
                item.put("qty", qty);
                BigDecimal unitPrice = (BigDecimal) item.get("unitPrice");
                item.put("totalPrice", unitPrice.multiply(BigDecimal.valueOf(qty)));
            });
        cartData.put("items", items);
        saveCart(userId, cartData);
        return buildCartResponse(cartData);
    }

    public CartResponse removeItem(UUID userId, UUID productId) {
        Map<String, Object> cartData = getOrCreateCartData(userId);
        List<Map<String, Object>> items = getItems(cartData);
        items.removeIf(i -> i.get("productId").toString().equals(productId.toString()));
        cartData.put("items", items);
        saveCart(userId, cartData);
        return buildCartResponse(cartData);
    }

    public void clearCart(UUID userId) {
        storeDelete(cartKey(userId));
    }

    public CartResponse syncCart(UUID userId, CartSyncRequest req) {
        for (CartSyncRequest.CartItem item : req.getItems()) {
            try {
                AddToCartRequest r = new AddToCartRequest(item.getProductId(), item.getVariantId(), item.getQty());
                r.setSize(item.getSize());
                addItem(userId, r);
            } catch (Exception e) {
                log.warn("Failed to sync cart item {}: {}", item.getProductId(), e.getMessage());
            }
        }
        return getCart(userId);
    }

    public CartResponse applyCoupon(UUID userId, String code) {
        Map<String, Object> cartData = getOrCreateCartData(userId);
        BigDecimal subtotal = calculateSubtotal(getItems(cartData));
        CouponResponse coupon = couponService.validateCoupon(code, subtotal, userId);
        cartData.put("couponCode", code);
        cartData.put("discountAmount", coupon.getDiscountAmount());
        saveCart(userId, cartData);
        return buildCartResponse(cartData);
    }

    public CartResponse removeCoupon(UUID userId) {
        Map<String, Object> cartData = getOrCreateCartData(userId);
        cartData.remove("couponCode");
        cartData.remove("discountAmount");
        saveCart(userId, cartData);
        return buildCartResponse(cartData);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getOrCreateCartData(UUID userId) {
        String key = cartKey(userId);
        Map<String, Object> data = (Map<String, Object>) storeGet(key);
        if (data == null) data = new HashMap<>();
        if (!data.containsKey("items")) data.put("items", new ArrayList<>());
        return data;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getItems(Map<String, Object> cartData) {
        Object items = cartData.get("items");
        if (items instanceof List) return (List<Map<String, Object>>) items;
        return new ArrayList<>();
    }

    private void saveCart(UUID userId, Map<String, Object> cartData) {
        storePut(cartKey(userId), cartData);
    }

    // Redis-with-in-memory-fallback helpers
    private Object storeGet(String key) {
        try {
            if (redisTemplate != null) return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.debug("Redis unavailable, using in-memory store");
        }
        return inMemoryStore.get(key);
    }

    private void storePut(String key, Object value) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(key, value, CART_TTL_DAYS, TimeUnit.DAYS);
                return;
            }
        } catch (Exception e) {
            log.debug("Redis unavailable, using in-memory store");
        }
        inMemoryStore.put(key, value);
    }

    private void storeDelete(String key) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(key);
                return;
            }
        } catch (Exception e) {
            log.debug("Redis unavailable, using in-memory store");
        }
        inMemoryStore.remove(key);
    }

    private BigDecimal calculateSubtotal(List<Map<String, Object>> items) {
        return items.stream()
            .map(i -> {
                Object tp = i.get("totalPrice");
                if (tp instanceof BigDecimal) return (BigDecimal) tp;
                return new BigDecimal(tp.toString());
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CartResponse buildCartResponse(Map<String, Object> cartData) {
        List<Map<String, Object>> items = getItems(cartData);
        BigDecimal subtotal = calculateSubtotal(items);
        BigDecimal discount = cartData.get("discountAmount") != null ?
            new BigDecimal(cartData.get("discountAmount").toString()) : BigDecimal.ZERO;
        // Flat ₹50 shipping on every order (only when cart has items)
        BigDecimal shipping = items.isEmpty() ? BigDecimal.ZERO : new BigDecimal("50");
        BigDecimal total = subtotal.subtract(discount).add(shipping);

        List<CartResponse.CartItemResponse> itemResponses = items.stream().map(i -> {
            CartResponse.CartItemResponse r = new CartResponse.CartItemResponse();
            r.setProductId(i.get("productId").toString());
            r.setVariantId(i.get("variantId") != null ? Long.valueOf(i.get("variantId").toString()) : null);
            r.setProductName((String) i.get("productName"));
            r.setProductImage((String) i.get("productImage"));
            r.setSlug((String) i.get("slug"));
            r.setUnitPrice(new BigDecimal(i.get("unitPrice").toString()));
            r.setQty((Integer) i.get("qty"));
            r.setTotalPrice(new BigDecimal(i.get("totalPrice").toString()));
            r.setStockQty(i.get("stockQty") != null ? (Integer) i.get("stockQty") : 999);
            r.setVariantLabel((String) i.get("variantLabel"));
            r.setSize((String) i.get("size"));
            return r;
        }).collect(Collectors.toList());

        return CartResponse.builder()
            .items(itemResponses)
            .subtotal(subtotal)
            .discountAmount(discount)
            .couponCode((String) cartData.get("couponCode"))
            .shippingCharge(shipping)
            .total(total)
            .itemCount(items.stream().mapToInt(i -> (Integer) i.get("qty")).sum())
            .build();
    }

    private CartResponse emptyCart() {
        return CartResponse.builder()
            .items(List.of()).subtotal(BigDecimal.ZERO).discountAmount(BigDecimal.ZERO)
            .shippingCharge(BigDecimal.ZERO).total(BigDecimal.ZERO).itemCount(0).build();
    }

    private String cartKey(UUID userId) {
        return CART_PREFIX + userId.toString();
    }
}
