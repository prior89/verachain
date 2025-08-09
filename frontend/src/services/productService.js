import api from './api';

const productService = {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async verifyProduct(data) {
    try {
      const response = await api.post('/products/verify', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateVerificationStatus(id, statusData) {
    try {
      const response = await api.put(`/products/${id}/verify-status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async transferOwnership(id, newOwnerId) {
    try {
      const response = await api.post(`/products/${id}/transfer`, { newOwnerId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getUserProducts() {
    try {
      const response = await api.get('/products/user/my-products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async uploadProductImage(formData) {
    try {
      const response = await api.post('/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default productService;
