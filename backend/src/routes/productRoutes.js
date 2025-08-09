const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  verifyProduct,
  updateVerificationStatus,
  transferOwnership,
  getUserProducts
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.post('/verify', optionalAuth, verifyProduct);

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

router.use(protect);

router.post('/', createProduct);
router.get('/user/my-products', getUserProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/transfer', transferOwnership);

router.put('/:id/verify-status', authorize('admin', 'vendor'), updateVerificationStatus);

module.exports = router;