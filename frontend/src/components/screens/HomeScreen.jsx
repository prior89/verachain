import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import { toast } from 'react-toastify';
import './HomeScreen.css';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-products');
  const [verifyData, setVerifyData] = useState({ serialNumber: '' });
  const [verificationResult, setVerificationResult] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'handbag',
    serialNumber: '',
    manufacturingDate: '',
    description: ''
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    if (activeTab === 'my-products') {
      loadUserProducts();
    } else {
      loadAllProducts();
    }
  }, [activeTab]);

  const loadUserProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getUserProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await productService.verifyProduct(verifyData);
      if (response.success) {
        setVerificationResult(response.data);
        toast.success('Product verification completed');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await productService.createProduct(newProduct);
      if (response.success) {
        toast.success('Product added successfully');
        setShowAddProduct(false);
        setNewProduct({
          name: '',
          brand: '',
          category: 'handbag',
          serialNumber: '',
          manufacturingDate: '',
          description: ''
        });
        loadUserProducts();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await productService.deleteProduct(productId);
        if (response.success) {
          toast.success('Product deleted successfully');
          loadUserProducts();
        }
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      verified: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      counterfeit: 'badge-danger'
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-small">V</div>
            <h1>VERACHAIN</h1>
          </div>
          <div className="user-section">
            <span className="user-name">Welcome, {user?.username || user?.email}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'my-products' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-products')}
          >
            My Products
          </button>
          <button 
            className={`tab ${activeTab === 'all-products' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-products')}
          >
            All Products
          </button>
          <button 
            className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Product
          </button>
        </div>

        <div className="content-area">
          {activeTab === 'my-products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>My Products</h2>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddProduct(true)}
                >
                  Add Product
                </button>
              </div>

              {showAddProduct && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>Add New Product</h3>
                    <form onSubmit={handleAddProduct}>
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Brand"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                        required
                      />
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        required
                      >
                        <option value="handbag">Handbag</option>
                        <option value="watch">Watch</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="clothing">Clothing</option>
                        <option value="shoes">Shoes</option>
                        <option value="accessories">Accessories</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Serial Number"
                        value={newProduct.serialNumber}
                        onChange={(e) => setNewProduct({...newProduct, serialNumber: e.target.value})}
                        required
                      />
                      <input
                        type="date"
                        placeholder="Manufacturing Date"
                        value={newProduct.manufacturingDate}
                        onChange={(e) => setNewProduct({...newProduct, manufacturingDate: e.target.value})}
                        required
                      />
                      <textarea
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        rows="3"
                      />
                      <div className="modal-actions">
                        <button type="submit" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Product'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowAddProduct(false)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading">Loading products...</div>
              ) : products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-header">
                        <h3>{product.name}</h3>
                        <span className={getStatusBadgeClass(product.verificationStatus)}>
                          {product.verificationStatus}
                        </span>
                      </div>
                      <div className="product-details">
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Serial:</strong> {product.serialNumber}</p>
                        <p><strong>Date:</strong> {new Date(product.manufacturingDate).toLocaleDateString()}</p>
                      </div>
                      <div className="product-actions">
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No products found. Add your first product!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all-products' && (
            <div className="products-section">
              <h2>All Products</h2>
              {loading ? (
                <div className="loading">Loading products...</div>
              ) : products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-header">
                        <h3>{product.name}</h3>
                        <span className={getStatusBadgeClass(product.verificationStatus)}>
                          {product.verificationStatus}
                        </span>
                      </div>
                      <div className="product-details">
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Owner:</strong> {product.owner?.username || 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No products available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="verify-section">
              <h2>Verify Product Authenticity</h2>
              <form onSubmit={handleVerifyProduct} className="verify-form">
                <input
                  type="text"
                  placeholder="Enter Serial Number"
                  value={verifyData.serialNumber}
                  onChange={(e) => setVerifyData({ serialNumber: e.target.value })}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Product'}
                </button>
              </form>

              {verificationResult && (
                <div className={`verification-result ${verificationResult.isAuthentic ? 'authentic' : 'not-authentic'}`}>
                  <h3>Verification Result</h3>
                  <p><strong>Status:</strong> {verificationResult.verificationStatus}</p>
                  <p><strong>Message:</strong> {verificationResult.message}</p>
                  {verificationResult.name && (
                    <>
                      <p><strong>Product:</strong> {verificationResult.name}</p>
                      <p><strong>Brand:</strong> {verificationResult.brand}</p>
                      <p><strong>Category:</strong> {verificationResult.category}</p>
                    </>
                  )}
                  {verificationResult.blockchainVerified && (
                    <p className="blockchain-badge">??Blockchain Verified</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

