package com.ecommerce.service;

import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.util.PaginationUtils;
import com.ecommerce.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    @Cacheable("categories:tree")
    public List<CategoryResponse> getCategoryTree() {
        List<Category> roots = categoryRepository.findByParentIsNullOrderByDisplayOrderAsc();
        return roots.stream().map(this::toCategoryResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllFlat() {
        return categoryRepository.findAll().stream().map(this::toCategoryResponse).collect(Collectors.toList());
    }

    public com.ecommerce.dto.response.PagedResponse<ProductResponse> getProductsByCategory(String slug, int page, int size) {
        Category cat = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return productService.getProducts(page, size, cat.getId(), null, null, null, null, null, null, null);
    }

    @Transactional
    @CacheEvict(value = "categories:tree", allEntries = true)
    public CategoryResponse createCategory(Map<String, Object> req) {
        String name = (String) req.get("name");
        String slug = SlugUtils.toSlug(name);
        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        Category category = Category.builder()
            .name(name)
            .slug(slug)
            .description((String) req.get("description"))
            .imageUrl((String) req.get("imageUrl"))
            .isActive(true)
            .displayOrder(req.get("displayOrder") != null ? (Integer) req.get("displayOrder") : 0)
            .build();

        if (req.get("parentId") != null) {
            Long parentId = Long.valueOf(req.get("parentId").toString());
            category.setParent(categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", parentId)));
        }
        return toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories:tree", allEntries = true)
    public CategoryResponse updateCategory(Long id, Map<String, Object> req) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (req.get("name") != null) cat.setName((String) req.get("name"));
        if (req.get("description") != null) cat.setDescription((String) req.get("description"));
        if (req.get("imageUrl") != null) cat.setImageUrl((String) req.get("imageUrl"));
        if (req.get("isActive") != null) cat.setActive((Boolean) req.get("isActive"));
        return toCategoryResponse(categoryRepository.save(cat));
    }

    @Transactional
    @CacheEvict(value = "categories:tree", allEntries = true)
    public void deleteCategory(Long id) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (categoryRepository.countProductsByCategoryId(id) > 0) {
            throw new IllegalArgumentException("Cannot delete category with existing products");
        }
        categoryRepository.delete(cat);
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return CategoryResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .slug(c.getSlug())
            .description(c.getDescription())
            .imageUrl(c.getImageUrl())
            .displayOrder(c.getDisplayOrder())
            .isActive(c.isActive())
            .parentId(c.getParent() != null ? c.getParent().getId() : null)
            .children(c.getChildren() != null ?
                c.getChildren().stream().map(this::toCategoryResponse).collect(Collectors.toList()) :
                List.of())
            .build();
    }
}
