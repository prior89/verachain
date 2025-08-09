const express = require('express');
const router = express.Router();
const { mintNFT, transferNFT, burnNFT, getUserNFTs, getNFTDetails } = require('../controllers/nftController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/mint', mintNFT);
router.post('/transfer', transferNFT);
router.post('/burn', burnNFT);
router.get('/user/:userId', getUserNFTs);
router.get('/details/:tokenId', getNFTDetails);

module.exports = router;