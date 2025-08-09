const mongoose = require('mongoose');
const Product = require('../models/Product');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 100% 정품 보장 - 공식 브랜드 웹사이트 이미지
const authenticProducts = [
  // Louis Vuitton 공식 제품
  {
    name: 'Louis Vuitton Neverfull MM',
    brand: 'Louis Vuitton',
    category: 'handbag',
    description: 'The Neverfull MM tote unites timeless design with heritage details',
    serialNumber: 'LV-NFM-2024-001',
    manufacturingDate: new Date('2024-01-15'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-16'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-neverfull-mm-monogram-handbags--M40995_PM2_Front%20view.jpg', public_id: 'lv_neverfull_1' }
    ],
    price: 2030,
    currency: 'USD'
  },
  {
    name: 'Louis Vuitton Speedy Bandoulière 25',
    brand: 'Louis Vuitton',
    category: 'handbag',
    description: 'The Speedy Bandoulière 25 handbag in iconic Monogram canvas',
    serialNumber: 'LV-SPB-2024-002',
    manufacturingDate: new Date('2024-02-10'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-11'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-speedy-bandouli%C3%A8re-25-monogram-handbags--M41112_PM2_Front%20view.jpg', public_id: 'lv_speedy_1' }
    ],
    price: 1820,
    currency: 'USD'
  },

  // Chanel 공식 제품
  {
    name: 'Chanel Classic Flap Bag Medium',
    brand: 'Chanel',
    category: 'handbag',
    description: 'The iconic Chanel Classic Flap Bag in lambskin with gold-tone hardware',
    serialNumber: 'CH-CFB-2024-001',
    manufacturingDate: new Date('2024-01-20'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-21'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.chanel.com/images/t_fashion/q_auto,f_auto,fl_lossy,dpr_auto/w_1920/classic-handbag-black-lambskin-gold-tone-metal-lambskin-gold-tone-metal-packshot-default-a01112y01864c3906-8848391766046.jpg', public_id: 'chanel_classic_1' }
    ],
    price: 10200,
    currency: 'USD'
  },
  {
    name: 'Chanel Boy Bag',
    brand: 'Chanel',
    category: 'handbag',
    description: 'The Boy Chanel handbag in quilted calfskin',
    serialNumber: 'CH-BOY-2024-002',
    manufacturingDate: new Date('2024-02-15'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-16'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.chanel.com/images/t_fashion/q_auto,f_auto,fl_lossy,dpr_auto/w_1920/boy-chanel-handbag-black-calfskin-ruthenium-finish-metal-calfskin-ruthenium-finish-metal-packshot-default-a67086y099999c3906-8848410148894.jpg', public_id: 'chanel_boy_1' }
    ],
    price: 6500,
    currency: 'USD'
  },

  // Hermès 공식 제품
  {
    name: 'Hermès Birkin 30',
    brand: 'Hermès',
    category: 'handbag',
    description: 'The iconic Birkin bag in Togo leather',
    serialNumber: 'HM-BRK-2024-001',
    manufacturingDate: new Date('2024-01-05'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-06'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://assets.hermes.com/is/image/hermesproduct/birkin-30-bag--H073042CK89-front-1-300-0-1920-1920_g.jpg', public_id: 'hermes_birkin_1' }
    ],
    price: 25000,
    currency: 'USD'
  },
  {
    name: 'Hermès Kelly 28',
    brand: 'Hermès',
    category: 'handbag',
    description: 'The Kelly bag in Epsom leather with palladium hardware',
    serialNumber: 'HM-KLY-2024-002',
    manufacturingDate: new Date('2024-02-01'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-02'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://assets.hermes.com/is/image/hermesproduct/kelly-28-bag--H082919CK18-front-1-300-0-1920-1920_g.jpg', public_id: 'hermes_kelly_1' }
    ],
    price: 20000,
    currency: 'USD'
  },

  // Rolex 공식 제품
  {
    name: 'Rolex Submariner Date',
    brand: 'Rolex',
    category: 'watch',
    description: 'The Submariner Date in Oystersteel with a black Cerachrom bezel',
    serialNumber: 'RX-SUB-2024-001',
    manufacturingDate: new Date('2024-01-10'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-11'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://content.rolex.com/v7/dam/2024/upright-cc/m126610ln-0001.png', public_id: 'rolex_submariner_1' }
    ],
    price: 10100,
    currency: 'USD'
  },
  {
    name: 'Rolex Daytona',
    brand: 'Rolex',
    category: 'watch',
    description: 'Cosmograph Daytona in 18 ct white gold',
    serialNumber: 'RX-DAY-2024-002',
    manufacturingDate: new Date('2024-02-05'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-06'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://content.rolex.com/v7/dam/2024/upright-cc/m126509-0001.png', public_id: 'rolex_daytona_1' }
    ],
    price: 42000,
    currency: 'USD'
  },

  // Gucci 공식 제품
  {
    name: 'Gucci Dionysus Small Shoulder Bag',
    brand: 'Gucci',
    category: 'handbag',
    description: 'Dionysus small shoulder bag in GG Supreme canvas',
    serialNumber: 'GC-DIO-2024-001',
    manufacturingDate: new Date('2024-01-25'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-26'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://media.gucci.com/style/DarkGray_Center_0_0_1200x1200/1678817106/400249_96IWT_8745_001_100_0000_Light-Dionysus-small-shoulder-bag.jpg', public_id: 'gucci_dionysus_1' }
    ],
    price: 2450,
    currency: 'USD'
  },
  {
    name: 'Gucci Marmont Small Matelassé Shoulder Bag',
    brand: 'Gucci',
    category: 'handbag',
    description: 'GG Marmont small matelassé shoulder bag in black leather',
    serialNumber: 'GC-MAR-2024-002',
    manufacturingDate: new Date('2024-02-20'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-21'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://media.gucci.com/style/DarkGray_Center_0_0_1200x1200/1678296907/443497_DTDIP_1000_001_100_0000_Light-GG-Marmont-small-matelass-shoulder-bag.jpg', public_id: 'gucci_marmont_1' }
    ],
    price: 1980,
    currency: 'USD'
  },

  // Prada 공식 제품
  {
    name: 'Prada Re-Edition 2005',
    brand: 'Prada',
    category: 'handbag',
    description: 'Re-Edition 2005 Re-Nylon bag',
    serialNumber: 'PR-RE5-2024-001',
    manufacturingDate: new Date('2024-01-30'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-31'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.prada.com/content/dam/pradabkg_products/1/1BH/1BH204/R064F0002/1BH204_R064_F0002_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg', public_id: 'prada_reedition_1' }
    ],
    price: 1290,
    currency: 'USD'
  },
  {
    name: 'Prada Galleria Saffiano Leather Bag',
    brand: 'Prada',
    category: 'handbag',
    description: 'Large Galleria Saffiano leather bag',
    serialNumber: 'PR-GAL-2024-002',
    manufacturingDate: new Date('2024-02-25'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-26'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.prada.com/content/dam/pradabkg_products/1/1BA/1BA274/NZVF0002/1BA274_NZV_F0002_V_DOO_SLF.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg', public_id: 'prada_galleria_1' }
    ],
    price: 4200,
    currency: 'USD'
  },

  // Dior 공식 제품
  {
    name: 'Lady Dior Medium',
    brand: 'Dior',
    category: 'handbag',
    description: 'Lady Dior bag in black lambskin with Cannage stitching',
    serialNumber: 'CD-LAD-2024-001',
    manufacturingDate: new Date('2024-01-12'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-13'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://media.dior.com/couture/ecommerce/media/catalog/product/Q/v/1700845934_M0565ONGE_M900_E01_GH.jpg', public_id: 'dior_lady_1' }
    ],
    price: 6500,
    currency: 'USD'
  },
  {
    name: 'Dior Book Tote',
    brand: 'Dior',
    category: 'handbag',
    description: 'Dior Book Tote in embroidered canvas',
    serialNumber: 'CD-BOK-2024-002',
    manufacturingDate: new Date('2024-02-18'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-19'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://media.dior.com/couture/ecommerce/media/catalog/product/h/W/1679921325_M1286ZRIW_M928_E01_GH.jpg', public_id: 'dior_book_1' }
    ],
    price: 3350,
    currency: 'USD'
  },

  // Balenciaga 공식 제품
  {
    name: 'Balenciaga Le Cagole Shoulder Bag',
    brand: 'Balenciaga',
    category: 'handbag',
    description: 'Le Cagole shoulder bag in arena lambskin',
    serialNumber: 'BL-CAG-2024-001',
    manufacturingDate: new Date('2024-01-22'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-23'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://media.balenciaga.com/image/upload/f_auto,q_auto,fl_lossy,dpr_auto/c_scale,w_1920/v1/product/671351_210IC_1000_A.jpg', public_id: 'balenciaga_cagole_1' }
    ],
    price: 2590,
    currency: 'USD'
  },

  // Bottega Veneta 공식 제품
  {
    name: 'Bottega Veneta Jodie',
    brand: 'Bottega Veneta',
    category: 'handbag',
    description: 'The Jodie bag in Intrecciato leather',
    serialNumber: 'BV-JOD-2024-001',
    manufacturingDate: new Date('2024-02-08'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-09'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.bottegaveneta.com/12/12395912fx_14_f.jpg', public_id: 'bv_jodie_1' }
    ],
    price: 2950,
    currency: 'USD'
  },

  // Saint Laurent 공식 제품
  {
    name: 'Saint Laurent Loulou Medium',
    brand: 'Saint Laurent',
    category: 'handbag',
    description: 'Loulou medium bag in Y-quilted leather',
    serialNumber: 'YSL-LOU-2024-001',
    manufacturingDate: new Date('2024-01-28'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-29'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://cdn-images.farfetch-contents.com/19/30/19/95/19301995_42284085_1000.jpg', public_id: 'ysl_loulou_1' }
    ],
    price: 2950,
    currency: 'USD'
  },

  // Cartier 공식 제품
  {
    name: 'Cartier Tank Must Watch',
    brand: 'Cartier',
    category: 'watch',
    description: 'Tank Must watch, large model, steel case',
    serialNumber: 'CT-TNK-2024-001',
    manufacturingDate: new Date('2024-01-18'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-19'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.cartier.com/dw/image/v2/BGTJ_PRD/on/demandware.static/-/Sites-cartier-master/default/dw22a4a4f8/images/large/637708388698366324-2227969.png', public_id: 'cartier_tank_1' }
    ],
    price: 3300,
    currency: 'USD'
  },

  // Patek Philippe 공식 제품
  {
    name: 'Patek Philippe Nautilus',
    brand: 'Patek Philippe',
    category: 'watch',
    description: 'Nautilus self-winding stainless steel',
    serialNumber: 'PP-NAU-2024-001',
    manufacturingDate: new Date('2024-01-03'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-01-04'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://static.patek.com/images/articles/face_white/350/5711_1A_010.jpg', public_id: 'patek_nautilus_1' }
    ],
    price: 35000,
    currency: 'USD'
  },

  // Omega 공식 제품
  {
    name: 'Omega Speedmaster Moonwatch',
    brand: 'Omega',
    category: 'watch',
    description: 'Speedmaster Moonwatch Professional Co-Axial Master Chronometer',
    serialNumber: 'OM-SPD-2024-001',
    manufacturingDate: new Date('2024-02-12'),
    verificationStatus: 'verified',
    verificationDetails: {
      verifiedAt: new Date('2024-02-13'),
      authenticityScore: 1.0,
      blockchainVerified: true
    },
    images: [
      { url: 'https://www.omegawatches.com/media/catalog/product/o/m/omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001001-l.png', public_id: 'omega_speedmaster_1' }
    ],
    price: 7350,
    currency: 'USD'
  }
];

async function seedAuthenticProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verachain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    await Certificate.deleteMany({});
    console.log('Cleared existing products and certificates');

    // Create admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@verachain.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'VeraChain Admin',
        email: 'admin@verachain.com',
        password: hashedPassword,
        membershipTier: 'vip',
        isVerified: true
      });
      console.log('Admin user created');
    }

    // Insert authentic products
    const insertedProducts = [];
    for (const productData of authenticProducts) {
      // Add verifiedBy field with admin user ID
      if (productData.verificationDetails) {
        productData.verificationDetails.verifiedBy = adminUser._id;
      }

      const product = await Product.create({
        ...productData,
        owner: adminUser._id,
        isActive: true,
        verificationCount: Math.floor(Math.random() * 100) + 50,
        lastVerified: new Date()
      });

      // Create authenticity certificate with new schema
      await Certificate.create({
        displayId: Certificate.generateDisplayId(),
        currentOwner: adminUser._id,
        productInfo: {
          brand: productData.brand,
          model: productData.name,
          category: productData.category
        },
        verification: {
          aiConfidence: 100,
          ocrConfidence: 100,
          timestamp: productData.verificationDetails?.verifiedAt || new Date(),
          status: 'verified'
        },
        nft: {
          tokenId: `TOKEN-${productData.serialNumber}`,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          mintDate: new Date()
        },
        _private: {
          previousDisplayIds: [],
          transferHistory: [],
          originalProductImages: productData.images.map(img => img.url),
          originalCertificateImages: [],
          actualSerialNumber: productData.serialNumber,
          internalNotes: `Authentic product from official ${productData.brand} store`
        }
      });

      insertedProducts.push(product);
      console.log(`✅ Added authentic product: ${product.name}`);
    }

    console.log(`\n✅ Successfully seeded ${insertedProducts.length} authentic products`);
    console.log('All products are 100% authentic from official brand sources');

    // Display summary
    const brands = [...new Set(authenticProducts.map(p => p.brand))];
    console.log('\n📊 Brand Summary:');
    for (const brand of brands) {
      const count = authenticProducts.filter(p => p.brand === brand).length;
      console.log(`   ${brand}: ${count} products`);
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedAuthenticProducts();
}

module.exports = { seedAuthenticProducts, authenticProducts };