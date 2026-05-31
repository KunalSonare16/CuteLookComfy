import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { addRecentlyViewed, useRecentlyViewed } from '../hooks/useRecentlyViewed';
import useWindowSize from '../hooks/useWindowSize';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

function ReviewForm({ productId, user, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return (
    <div style={{ padding: '16px', background: 'var(--surface)', borderLeft: '3px solid var(--red)' }}>
      <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)' }}>
        <a href="/login" style={{ color: 'var(--red)' }}>Sign in</a> to write a review.
      </p>
    </div>
  );

  if (submitted) return (
    <div style={{ padding: '16px', background: 'var(--surface)', borderLeft: '3px solid #22c55e' }}>
      <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>✓ Thanks for your review!</p>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await productAPI.createReview(productId, { rating, comment });
      setSubmitted(true);
      onSuccess();
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '8px' }}>
      <h4 style={{ fontFamily: "'Barlow Condensed'", fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '4px' }}>Write a Review</h4>
      <p style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Only customers who purchased this product can leave a review.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Rating</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: s <= (hover || rating) ? '#E8242A' : 'var(--border)', padding: '0 2px', lineHeight: 1 }}>
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Your Review</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} required placeholder="Share your experience with this product..."
            style={{ width: '100%', boxSizing: 'border-box', background: 'none', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter', fontSize: '13px', outline: 'none', resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = 'var(--text)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', padding: '10px 24px', background: submitting ? 'var(--text-muted)' : 'var(--red)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isMobile } = useWindowSize();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomOpen, setZoomOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getBySlug(slug),
    select: d => d.data.data,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => productAPI.getReviews(product.id, { page: 0, size: 10 }),
    select: d => d.data.data,
    enabled: !!product?.id,
  });

  const { data: related } = useQuery({
    queryKey: ['related', product?.categorySlug],
    queryFn: () => categoryAPI.getProducts(product.categorySlug, { size: 4, sort: 'popular' }),
    select: d => d.data.data?.content?.filter(p => p.id !== product?.id).slice(0, 4),
    enabled: !!product?.categorySlug,
  });

  // All hooks MUST be before any early returns
  const recentlyViewed = useRecentlyViewed(product?.id);

  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} — CuteLookComfy`;
    const desc = product.shortDescription || product.description?.slice(0, 150);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc) metaDesc.setAttribute('content', desc);
  }, [product]);

  // Early returns (after all hooks)
  if (isLoading) return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '24px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading…</div>
    </div>
  );
  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];
  const sizeOptions = (product.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
  // Group variants by attribute name (Size, Color, etc.) so admin can add any attribute type
  const variantGroups = Object.values(
    variants.reduce((acc, v) => {
      const name = v.attributeName || 'Option';
      if (!acc[name]) acc[name] = { name, options: [] };
      acc[name].options.push(v);
      return acc;
    }, {})
  );
  const hasDiscount = product.comparePrice && product.comparePrice > product.sellingPrice;
  const discountPct = hasDiscount ? Math.round((1 - product.sellingPrice / product.comparePrice) * 100) : null;
  const inStock = product.stockQty > 0;
  const avgRating = reviews?.content?.length
    ? (reviews.content.reduce((s, r) => s + r.rating, 0) / reviews.content.length).toFixed(1)
    : null;

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) { toast.error('Please select a size/variant'); return; }
    if (sizeOptions.length > 0 && !selectedSize) { toast.error('Please select a size'); return; }
    setAdding(true);
    const labelParts = [];
    if (selectedVariant) labelParts.push(`${selectedVariant.attributeName}: ${selectedVariant.attributeValue}`);
    if (selectedSize) labelParts.push(`Size: ${selectedSize}`);
    const variantLabel = labelParts.length ? labelParts.join(', ') : null;
    await addItem(product.id, selectedVariant?.id, qty, product, variantLabel, selectedSize);
    setAdding(false);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to save items'); return; }
    try {
      if (wishlisted) { await wishlistAPI.remove(product.id); setWishlisted(false); toast.success('Removed from wishlist'); }
      else { await wishlistAPI.add(product.id); setWishlisted(true); toast.success('Saved to wishlist'); }
    } catch {}
  };

  // JSON-LD Product Schema
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.sellingPrice,
      priceCurrency: 'INR',
      availability: product.stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: window.location.href,
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviews?.totalElements || 0,
      },
    }),
  } : null;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', paddingBottom: '80px' }}>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {/* Breadcrumb */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 32px 0' }}>
        <div style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '64px' }}>
          {/* Images */}
          <div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {images.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '72px' }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: '72px', height: '90px', padding: 0, border: 'none',
                        cursor: 'pointer', overflow: 'hidden',
                        outline: selectedImage === i ? '2px solid var(--red)' : '1px solid var(--border)',
                        outlineOffset: '2px',
                      }}
                    >
                      <img src={img.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              <div style={{ flex: 1, position: 'relative', aspectRatio: '3/4', overflow: 'hidden', cursor: 'zoom-in' }}
                onClick={() => setZoomOpen(true)}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.imageUrl || '/placeholder.jpg'}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px 8px', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none' }}>
                  Click to zoom
                </div>

                {discountPct && (
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    background: 'var(--red)', color: '#fff',
                    fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '5px 10px',
                  }}>
                    −{discountPct}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            {product.categoryName && (
              <Link to={`/shop/${product.categorySlug}`} style={{
                fontFamily: 'Inter', fontSize: '11px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--red)', textDecoration: 'none',
              }}>
                {product.categoryName}
              </Link>
            )}

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '-0.02em', color: 'var(--text)',
              margin: '12px 0 0', lineHeight: 0.95,
            }}>
              {product.name}
            </h1>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= Math.round(avgRating) ? '#E8242A' : 'var(--border)', fontSize: '14px' }}>★</span>
                  ))}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {avgRating} ({reviews.totalElements} reviews)
                </span>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '40px', fontWeight: 700, color: 'var(--red)',
              }}>
                ₹{product.sellingPrice?.toLocaleString()}
              </span>
              {hasDiscount && (
                <span style={{ fontFamily: 'Inter', fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.comparePrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Variants — grouped by attribute (Size, Color, etc.) */}
            {variantGroups.map(group => (
              <div key={group.name} style={{ marginTop: '24px' }}>
                <div style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {selectedVariant && selectedVariant.attributeName === group.name
                    ? `${group.name}: ${selectedVariant.attributeValue}`
                    : `Select ${group.name}`}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {group.options.map(v => {
                    const isColor = group.name.toLowerCase().includes('color') || group.name.toLowerCase().includes('colour');
                    const selected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQty === 0}
                        title={v.attributeValue}
                        style={{
                          minWidth: isColor ? '36px' : '48px', height: isColor ? '36px' : '48px',
                          padding: isColor ? 0 : '0 10px',
                          borderRadius: isColor ? '50%' : 0,
                          border: 'none',
                          background: isColor ? v.attributeValue.toLowerCase() : selected ? 'var(--black)' : 'var(--surface)',
                          color: selected ? 'var(--bg)' : v.stockQty === 0 ? 'var(--text-muted)' : 'var(--text)',
                          cursor: v.stockQty === 0 ? 'not-allowed' : 'pointer',
                          fontFamily: 'Inter', fontSize: '13px',
                          textDecoration: v.stockQty === 0 ? 'line-through' : 'none',
                          outline: selected ? '2px solid var(--red)' : '1px solid var(--border)',
                          outlineOffset: '2px',
                        }}
                      >
                        {isColor ? '' : v.attributeValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Sizes — set by admin as a simple list */}
            {sizeOptions.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {selectedSize ? `Size: ${selectedSize}` : 'Select Size'}
                  </div>
                  <Link to="/size-guide" style={{ fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)', textDecoration: 'none' }}>
                    Size Guide
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sizeOptions.map(sz => {
                    const selected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          minWidth: '48px', height: '48px', padding: '0 12px',
                          border: 'none',
                          background: selected ? 'var(--black)' : 'var(--surface)',
                          color: selected ? 'var(--bg)' : 'var(--text)',
                          cursor: 'pointer', fontFamily: 'Inter', fontSize: '13px',
                          outline: selected ? '2px solid var(--red)' : '1px solid var(--border)',
                          outlineOffset: '2px',
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '44px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '18px' }}>−</button>
                <span style={{ width: '44px', textAlign: 'center', fontFamily: 'Inter', fontSize: '15px', color: 'var(--text)' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: '44px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '18px' }}>+</button>
              </div>

              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={{
                    flex: 1, height: '44px',
                    background: 'var(--red)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter', fontSize: '12px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => !adding && (e.currentTarget.style.background = '#c51e22')}
                  onMouseLeave={e => e.currentTarget.style.background = '#E8242A'}
                >
                  {adding ? 'Adding…' : 'Add to Bag'}
                </button>
              ) : (
                <button disabled style={{
                  flex: 1, height: '44px', background: 'var(--surface)',
                  color: 'var(--text-muted)', border: '1px solid var(--border)',
                  fontFamily: 'Inter', fontSize: '12px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', cursor: 'not-allowed',
                }}>
                  Sold Out
                </button>
              )}

              <button
                onClick={handleWishlist}
                style={{
                  width: '44px', height: '44px',
                  background: 'none', border: '1px solid var(--border)',
                  cursor: 'pointer', color: wishlisted ? 'var(--red)' : 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Stock notice */}
            {inStock && product.stockQty <= 5 && (
              <p style={{ marginTop: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'var(--red)', letterSpacing: '0.05em' }}>
                Only {product.stockQty} left in stock
              </p>
            )}

            {/* Trust badges */}
            <div style={{
              marginTop: '28px', paddingTop: '24px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: '24px', flexWrap: 'wrap',
            }}>
              {['Flat ₹50 shipping', 'Easy 7-day returns', 'Secure checkout'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--red)', fontSize: '14px' }}>✓</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                {['description', 'details', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 20px 10px 0',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter', fontSize: '11px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--red)' : '2px solid transparent',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                      {product.description || 'No description available.'}
                    </p>
                  </motion.div>
                )}
                {activeTab === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        ['SKU', product.sku],
                        ['Category', product.categoryName],
                        ['Stock', product.stockQty + ' units'],
                        ['Weight', product.weight ? product.weight + ' g' : '—'],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{k}</div>
                          <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {reviews?.content?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        {reviews.content.map(r => (
                          <div key={r.id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{r.userName}</span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#E8242A' : 'var(--border)', fontSize: '12px' }}>★</span>)}
                              </div>
                            </div>
                            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>No reviews yet. Be the first!</p>
                    )}
                    <ReviewForm productId={product.id} user={user} onSuccess={() => {}} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related?.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '32px', letterSpacing: '-0.02em' }}>
              You May Also Like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '16px' }}>
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 48px' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '24px', letterSpacing: '-0.02em' }}>
              Recently Viewed
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '16px' }}>
              {recentlyViewed.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Bag */}
      <div className="sticky-atb">
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>{product.name}</div>
          <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--red)', fontWeight: 600 }}>₹{product.sellingPrice?.toLocaleString()}</div>
        </div>
        {inStock ? (
          <button onClick={handleAddToCart} disabled={adding} style={{ padding: '12px 24px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {adding ? 'Adding…' : 'Add to Bag'}
          </button>
        ) : (
          <button disabled style={{ padding: '12px 24px', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'Inter', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Sold Out</button>
        )}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '24px' }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[selectedImage]?.imageUrl || '/placeholder.jpg'}
              alt={product.name}
              style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setZoomOpen(false)} style={{ position: 'absolute', top: '20px', right: '24px', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', opacity: 0.7 }}>✕</button>
            {images.length > 1 && (
              <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '8px' }}>
                {images.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setSelectedImage(i); }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedImage === i ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
