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

    const passwordHash = await bcrypt.hash('Password123!', 12);

    // 1 Admin, 3 Sellers
    const adminId = new mongoose.Types.ObjectId();
    const seller1Id = new mongoose.Types.ObjectId();
    const seller2Id = new mongoose.Types.ObjectId();
    const seller3Id = new mongoose.Types.ObjectId();

    await db.collection('users').insertMany([
      { _id: adminId, name: 'Dawit Admin', email: 'admin@souq.example.com', password: passwordHash, role: 'admin', totpEnabled: true },
      { _id: seller1Id, name: 'Tigist Habesha Attire', email: 'tigist@seller.example.com', password: passwordHash, role: 'seller', totpEnabled: false },
      { _id: seller2Id, name: 'Abebe Ethiopian Coffee', email: 'abebe@seller.example.com', password: passwordHash, role: 'seller', totpEnabled: false },
      { _id: seller3Id, name: 'Addis Leather Works', email: 'leather@seller.example.com', password: passwordHash, role: 'seller', totpEnabled: false },
    ]);

    // 5 Categories
    const categories = [
      { name: 'Traditional Clothing', slug: 'traditional-clothing', description: 'Handcrafted Ethiopian cultural attire' },
      { name: 'Ethiopian Coffee & Spices', slug: 'coffee-spices', description: 'Yirgacheffe, Sidamo, and traditional blends' },
      { name: 'Leather Goods', slug: 'leather-goods', description: 'Genuine Ethiopian leather bags and footwear' },
      { name: 'Handmade Crafts', slug: 'handmade-crafts', description: 'Baskets, crosses, and pottery' },
      { name: 'Electronics & Accessories', slug: 'electronics', description: 'Mobile phones and tech accessories' },
    ];
    await db.collection('categories').insertMany(categories);

    // 50 Products (Prices in integer santim)
    const sampleProducts = [];
    const sellers = [seller1Id, seller2Id, seller3Id];

    for (let i = 1; i <= 50; i++) {
      const cat = categories[i % categories.length];
      const seller = sellers[i % sellers.length];
      sampleProducts.push({
        seller,
        name: `${cat.name} Premium Item #${i}`,
        description: `Authentic, high-grade Ethiopian ${cat.name.toLowerCase()} sourced directly from local producers in Addis Ababa.`,
        price: (500 + i * 50) * 100, // 550.00 ETB to 3,000.00 ETB in santim
        category: cat.name,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'],
        stock: 50,
        reserved: 0,
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.collection('products').insertMany(sampleProducts);
    console.log(`[Seed] Seeded 1 admin, 3 sellers, 5 categories, and 50 products in integer santim.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
};

run();
