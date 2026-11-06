import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/souq_marketplace?replicaSet=rs0';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    const db = mongoose.connection.db;

    // Clean existing seed collections
    await db.collection('users').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@souq.test';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    const sellerPasswordHash = await bcrypt.hash('Password123!', 12);

    // 1 Admin, 3 Authentic Ethiopian Sellers
    const adminId = new mongoose.Types.ObjectId();
    const seller1Id = new mongoose.Types.ObjectId();
    const seller2Id = new mongoose.Types.ObjectId();
    const seller3Id = new mongoose.Types.ObjectId();

    await db.collection('users').insertMany([
      { _id: adminId, name: 'Dawit Admin', email: adminEmail, password: adminPasswordHash, role: 'admin', totpEnabled: false },
      { _id: seller1Id, name: 'Tigist Habesha Couture', email: 'tigist@seller.example.com', password: sellerPasswordHash, role: 'seller', totpEnabled: false },
      { _id: seller2Id, name: 'Abebe Specialty Coffee Export', email: 'abebe@seller.example.com', password: sellerPasswordHash, role: 'seller', totpEnabled: false },
      { _id: seller3Id, name: 'Addis Leather Works', email: 'leather@seller.example.com', password: sellerPasswordHash, role: 'seller', totpEnabled: false },
    ]);

    // 5 Core Categories
    const categories = [
      { name: 'Traditional Clothing', slug: 'traditional-clothing', description: 'Handcrafted Ethiopian cultural attire, Habesha kemis, and Netela' },
      { name: 'Coffee & Spices', slug: 'coffee-spices', description: 'Yirgacheffe, Sidamo, Harrar beans, and organic Berbere blends' },
      { name: 'Leather Goods', slug: 'leather-goods', description: 'Genuine Ethiopian highland cowhide bags, shoes, and wallets' },
      { name: 'Handmade Crafts', slug: 'handmade-crafts', description: 'Traditional Mesob baskets, black clay Jebena pots, and Axum crosses' },
      { name: 'Food & Honey', slug: 'food-honey', description: 'Organic white Wollega honey and Magna white teff grain' },
    ];
    await db.collection('categories').insertMany(categories);

    // 12 Authentic Ethiopian Sample Products with real images & integer santim prices
    const sampleProducts = [
      {
        seller: seller1Id,
        name: 'Royal Habesha Kemis with Gold Tilf (የሀበሻ ቀሚስ)',
        description: 'Authentic hand-woven pure Shemma cotton dress featuring intricate golden embroidery (Tibeb) along the neck and hemline. Includes matching Netela scarf.',
        price: 1250000, // 12,500.00 ETB
        category: 'Traditional Clothing',
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'],
        stock: 12,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller2Id,
        name: 'Yirgacheffe Grade 1 Specialty Washed Coffee (ይርጋጨፌ ቡና)',
        description: '100% Arabica heirloom beans cultivated in the high altitudes of Yirgacheffe, Sidama. Floral notes of jasmine, bergamot, and citrus. 1kg pack.',
        price: 145000, // 1,450.00 ETB
        category: 'Coffee & Spices',
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'],
        stock: 45,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller1Id,
        name: 'Traditional Handcrafted Black Clay Jebena with Sini Set (ባህላዊ ጀበና)',
        description: 'Authentic clay coffee pot handcrafted by heritage potters using ancestral pit-firing methods. Comes complete with 6 ceramic Sini cups and Rekebot tray.',
        price: 280000, // 2,800.00 ETB
        category: 'Handmade Crafts',
        images: ['https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=800&auto=format&fit=crop&q=80'],
        stock: 18,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller3Id,
        name: 'Artisan Full-Grain Ethiopian Leather Duffle Bag (የእጅ ሌዘር ቦርሳ)',
        description: 'Handcrafted from 100% natural vegetable-tanned Ethiopian highland cowhide, with reinforced stitching and antique brass hardware.',
        price: 890000, // 8,900.00 ETB
        category: 'Leather Goods',
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'],
        stock: 9,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller1Id,
        name: 'Vibrant Hand-Woven Ethiopian Mesob Dining Basket (ባህላዊ መሶብ)',
        description: 'Masterfully woven from dried mountain grass and dyed palm fibers in traditional vibrant geometric patterns. Features tall conical lid.',
        price: 620000, // 6,200.00 ETB
        category: 'Handmade Crafts',
        images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80'],
        stock: 7,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller2Id,
        name: 'Pure Sun-Dried Organic Berbere Blend (የተፈጨ ንፁህ በርበሬ)',
        description: 'Traditional slow-roasted blend of Mareko Fana red chili peppers, korarima (black cardamom), rue, ginger, garlic, and mountain herbs. 1kg pouch.',
        price: 85000, // 850.00 ETB
        category: 'Coffee & Spices',
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'],
        stock: 60,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller1Id,
        name: 'Handwoven Double-Layer Dorze Gabi (ባህላዊ የዶርዜ ጋቢ)',
        description: 'Woven in the legendary Dorze artisan tradition from 100% Ethiopian hand-spun cotton. Ultra-soft and warm with classical border fringe.',
        price: 480000, // 4,800.00 ETB
        category: 'Traditional Clothing',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'],
        stock: 15,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller2Id,
        name: 'Sidama Highland Peaberry Dark Roast (የሲዳማ ቡና)',
        description: 'Rare single-bean peaberry cherries hand-sorted from Sidama mountain estates. Rich dark chocolate and berry undertones. 1kg pack.',
        price: 160000, // 1,600.00 ETB
        category: 'Coffee & Spices',
        images: ['https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80'],
        stock: 30,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller1Id,
        name: 'Axum Sterling Silver Filigree Cross Pendant (የአክሱም ብር መስቀል)',
        description: 'Handcrafted solid 925 sterling silver cross inspired by the historic Axum obelisks. Detailed filigree scrollwork with genuine leather cord.',
        price: 350000, // 3,500.00 ETB
        category: 'Handmade Crafts',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'],
        stock: 14,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller2Id,
        name: 'Pristine Wollega White Mountain Honey (የወለጋ ነጭ ማር)',
        description: '100% pure raw white honey gathered from wild mountain blossoms in the forests of Wollega. Creamy texture and delicate floral taste. 1kg jar.',
        price: 195000, // 1,950.00 ETB
        category: 'Food & Honey',
        images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'],
        stock: 25,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller3Id,
        name: 'Ethiopian Highland Sheepskin Chelsea Boots (የቆዳ ጫማ)',
        description: 'Handcrafted premium Chelsea boots combining supple Ethiopian sheepskin lining with rugged bovine leather and non-slip rubber soles.',
        price: 540000, // 5,400.00 ETB
        category: 'Leather Goods',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'],
        stock: 16,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        seller: seller2Id,
        name: 'Superfine Magna White Teff Grain (የማኛ ነጭ ጤፍ)',
        description: 'Premium quality Magna grade gluten-free white teff from Debre Berhan. Ideal for baking light, spongy, authentic Ethiopian Injera. 10kg sack.',
        price: 320000, // 3,200.00 ETB
        category: 'Food & Honey',
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'],
        stock: 40,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('products').insertMany(sampleProducts);
    console.log(`[Seed] Successfully seeded ${sampleProducts.length} authentic Ethiopian products with real images and santim prices.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
};

run();
