const Product = require('../models/Product');
const User = require('../models/User');

const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      owner: req.user._id
    };

    const product = await Product.create(productData);

    await product.generateQRCode();
    await product.save();

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      category,
      verificationStatus,
      owner,
      search
    } = req.query;

    const query = {};

    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (owner) query.owner = owner;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('owner', 'username email')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('verificationDetails.verifiedBy', 'username email')
      .populate('transferHistory.from', 'username email')
      .populate('transferHistory.to', 'username email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

const verifyProduct = async (req, res, next) => {
  try {
    const { productId, serialNumber } = req.body;

    let product;

    if (productId) {
      product = await Product.findById(productId)
        .populate('owner', 'username email')
        .populate('verificationDetails.verifiedBy', 'username email');
    } else if (serialNumber) {
      product = await Product.findOne({ serialNumber })
        .populate('owner', 'username email')
        .populate('verificationDetails.verifiedBy', 'username email');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID or serial number'
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        verificationStatus: 'not_found'
      });
    }

    const verificationResult = {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      serialNumber: product.serialNumber,
      owner: product.owner,
      verificationStatus: product.verificationStatus,
      verificationDetails: product.verificationDetails,
      isAuthentic: product.verificationStatus === 'verified',
      blockchainVerified: !!product.blockchainData?.transactionHash,
      message: getVerificationMessage(product.verificationStatus)
    };

    res.status(200).json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    next(error);
  }
};

const updateVerificationStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify products'
      });
    }

    const { status, notes, authenticityScore } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.verificationStatus = status;
    product.verificationDetails = {
      verifiedBy: req.user._id,
      verifiedAt: Date.now(),
      verificationNotes: notes,
      authenticityScore: authenticityScore
    };

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const transferOwnership = async (req, res, next) => {
  try {
    const { newOwnerId } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer this product'
      });
    }

    const newOwner = await User.findById(newOwnerId);

    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: 'New owner not found'
      });
    }

    product.transferHistory.push({
      from: product.owner,
      to: newOwnerId,
      transferDate: Date.now()
    });

    product.owner = newOwnerId;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const getUserProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

function getVerificationMessage(status) {
  const messages = {
    verified: 'This product is verified as authentic',
    pending: 'Verification is pending',
    rejected: 'Verification was rejected',
    counterfeit: 'WARNING: This product has been identified as counterfeit',
    not_found: 'Product not found in our database'
  };
  return messages[status] || 'Unknown verification status';
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  verifyProduct,
  updateVerificationStatus,
  transferOwnership,
  getUserProducts
};