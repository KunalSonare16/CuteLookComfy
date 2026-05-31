import axios from 'axios';

// Empty string = same-origin (requests go through the dev-server proxy to the backend).
const API_URL = process.env.REACT_APP_API_URL !== undefined ? process.env.REACT_APP_API_URL : 'http://localhost:8092';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  // Bypass ngrok free-tier browser-warning interstitial on XHR/API calls
  headers: { 'ngrok-skip-browser-warning': 'true' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('token', data.data.accessToken);
        err.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(err.config);
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  me: () => api.get('/api/auth/me'),
  refresh: () => api.post('/api/auth/refresh'),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  sendRegisterOtp: (email) => api.post('/api/auth/register/send-otp', { email }),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getBySlug: (slug) => api.get(`/api/products/${slug}`),
  search: (q, params) => api.get('/api/products/search', { params: { q, ...params } }),
  featured: () => api.get('/api/products/featured'),
  newArrivals: () => api.get('/api/products/new-arrivals'),
  getReviews: (id, params) => api.get(`/api/products/${id}/reviews`, { params }),
  createReview: (id, data) => api.post(`/api/products/${id}/reviews`, data),
};

// Categories
export const categoryAPI = {
  getTree: () => api.get('/api/categories'),
  getProducts: (slug, params) => api.get(`/api/categories/${slug}/products`, { params }),
};

// Cart
export const cartAPI = {
  get: () => api.get('/api/cart'),
  addItem: (data) => api.post('/api/cart/items', data),
  updateItem: (productId, qty) => api.put(`/api/cart/items/${productId}`, null, { params: { qty } }),
  removeItem: (productId) => api.delete(`/api/cart/items/${productId}`),
  clear: () => api.delete('/api/cart'),
  sync: (data) => api.post('/api/cart/sync', data),
  applyCoupon: (code) => api.post('/api/cart/apply-coupon', { code }),
  removeCoupon: () => api.delete('/api/cart/coupon'),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/api/orders', data),
  getAll: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.put(`/api/orders/${id}/cancel`),
  getInvoice: (id) => api.get(`/api/orders/${id}/invoice`, { responseType: 'blob' }),
  track: (orderId, email) => api.get('/api/track', { params: { orderId, email } }),
  createReturn: (id, data) => api.post(`/api/orders/${id}/return`, data),
  getReturn: (id) => api.get(`/api/orders/${id}/return`),
};

// Payments
export const paymentAPI = {
  initiate: (orderId) => api.post('/api/payments/initiate', { orderId }),
  verify: (data) => api.post('/api/payments/verify', data),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/api/wishlist'),
  add: (productId) => api.post(`/api/wishlist/${productId}`),
  remove: (productId) => api.delete(`/api/wishlist/${productId}`),
};

// Coupons
export const couponAPI = {
  validate: (data) => api.post('/api/coupons/validate', data),
};

// User
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getAddresses: () => api.get('/api/users/addresses'),
  addAddress: (data) => api.post('/api/users/addresses', data),
  updateAddress: (id, data) => api.put(`/api/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/api/users/addresses/${id}/default`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/api/notifications', { params }),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
  unreadCount: () => api.get('/api/notifications/unread-count'),
};

// Newsletter
export const newsletterAPI = {
  subscribe: (email) => api.post('/api/newsletter/subscribe', { email }),
};

// Contact
export const contactAPI = {
  send: (data) => api.post('/api/contact', data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getRevenue: (days) => api.get('/api/admin/stats/revenue', { params: { days } }),
  getOrdersByStatus: () => api.get('/api/admin/stats/orders-by-status'),
  getTopProducts: (limit) => api.get('/api/admin/stats/top-products', { params: { limit } }),
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/api/admin/orders/${id}/status`, data),
  refundOrder: (id, data) => api.post(`/api/admin/orders/${id}/refund`, data),
  getProducts: (params) => api.get('/api/admin/products', { params }),
  createProduct: (data, images) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (images && images.length) images.forEach(f => fd.append('images', f));
    return api.post('/api/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  uploadProductImages: (id, fd) => api.post(`/api/admin/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),
  toggleProduct: (id) => api.patch(`/api/admin/products/${id}/toggle-active`),
  uploadImages: (id, formData) => api.post(`/api/admin/products/${id}/images`, formData),
  getCategories: () => api.get('/api/admin/categories'),
  createCategory: (data) => api.post('/api/admin/categories', data),
  updateCategory: (id, data) => api.put(`/api/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`),
  getCoupons: (params) => api.get('/api/admin/coupons', { params }),
  createCoupon: (data) => api.post('/api/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/api/admin/coupons/${id}`, data),
  toggleCoupon: (id) => api.patch(`/api/admin/coupons/${id}/toggle`),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  blockUser: (id) => api.patch(`/api/admin/users/${id}/block`),
  changeRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  getReviews: (params) => api.get('/api/admin/reviews', { params }),
  approveReview: (id) => api.patch(`/api/admin/reviews/${id}/approve`),
  rejectReview: (id) => api.patch(`/api/admin/reviews/${id}/reject`),
  getInventory: (params) => api.get('/api/admin/inventory', { params }),
  updateStock: (productId, qty) => api.patch(`/api/admin/inventory/${productId}/stock`, { qty }),
  getReturns: (params) => api.get('/api/admin/returns', { params }),
  updateReturnStatus: (id, status) => api.patch(`/api/admin/returns/${id}/status`, { status }),
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data) => api.put('/api/admin/settings', data),
};
