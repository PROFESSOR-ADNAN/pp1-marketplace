export interface ProductItem {
  _id: string;
  name: string;
  amharicName?: string;
  description: string;
  price: number; // in santim (1 ETB = 100 santim)
  category: string;
  images: string[];
  stock: number;
  seller: {
    _id?: string;
    name: string;
    location?: string;
  };
  rating?: number;
  reviewsCount?: number;
  badge?: string;
}

export const ETHIOPIAN_SAMPLE_PRODUCTS: ProductItem[] = [
  {
    _id: 'eth-prod-001',
    name: 'Royal Habesha Kemis with Gold Tilf (የሀበሻ ቀሚስ)',
    amharicName: 'የሀበሻ ቀሚስ በወርቅ ጥልፍ',
    description: 'Authentic hand-woven pure Shemma cotton dress featuring intricate golden embroidery (Tibeb) along the neck, cuffs, and hemline. Includes a lightweight matching Netela scarf. Perfect for holidays, weddings, and cultural celebrations.',
    price: 1250000, // 12,500.00 ETB
    category: 'Traditional Clothing',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    seller: {
      _id: 'seller-01',
      name: 'Tigist Habesha Couture',
      location: 'Shiro Meda, Addis Ababa',
    },
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Best Seller',
  },
  {
    _id: 'eth-prod-002',
    name: 'Yirgacheffe Grade 1 Specialty Washed Coffee (ይርጋጨፌ ቡና)',
    amharicName: 'ይርጋጨፌ አንደኛ ደረጃ ታጥቦ የተዘጋጀ ቡና',
    description: '100% Arabica heirloom beans cultivated in the high altitudes of Yirgacheffe, Sidama. Delivers exquisite floral notes of jasmine, bergamot, peach sweetness, and a bright clean citrus finish. Medium roast, 1kg pack.',
    price: 145000, // 1,450.00 ETB
    category: 'Coffee & Spices',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 45,
    seller: {
      _id: 'seller-02',
      name: 'Abebe Specialty Coffee Export',
      location: 'Bole, Addis Ababa',
    },
    rating: 5.0,
    reviewsCount: 112,
    badge: 'Single Origin',
  },
  {
    _id: 'eth-prod-003',
    name: 'Traditional Handcrafted Black Clay Jebena with Sini Set (ባህላዊ ጀበና እና ሲኒ)',
    amharicName: 'ባህላዊ የሸክላ ጀበና ከሲኒዎች ጋር',
    description: 'Authentic clay coffee pot handcrafted by heritage potters using ancestral pit-firing methods. Comes complete with 6 ceramic Sini cups and a traditional wooden Rekebot tray for authentic Ethiopian coffee ceremonies.',
    price: 280000, // 2,800.00 ETB
    category: 'Handmade Crafts',
    images: [
      'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 18,
    seller: {
      _id: 'seller-03',
      name: 'Etege Cultural Artisan Hub',
      location: 'Piazza, Addis Ababa',
    },
    rating: 4.8,
    reviewsCount: 47,
    badge: 'Ceremony Ready',
  },
  {
    _id: 'eth-prod-004',
    name: 'Artisan Full-Grain Ethiopian Leather Duffle Bag (የእጅ ሌዘር የጉዞ ቦርሳ)',
    amharicName: 'ከተፈጥሮ ቆዳ የተሠራ የጉዞ ቦርሳ',
    description: 'Handcrafted from 100% natural vegetable-tanned Ethiopian highland cowhide, globally renowned for its suppleness and tensile strength. Features reinforced stitching, antique brass hardware, and heavy-duty YKK zippers.',
    price: 890000, // 8,900.00 ETB
    category: 'Leather Goods',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 9,
    seller: {
      _id: 'seller-04',
      name: 'Addis Leather Works',
      location: 'Merkato, Addis Ababa',
    },
    rating: 4.9,
    reviewsCount: 64,
    badge: '100% Genuine Leather',
  },
  {
    _id: 'eth-prod-005',
    name: 'Vibrant Hand-Woven Ethiopian Mesob Dining Basket (ባህላዊ መሶብ)',
    amharicName: 'በጥበብ የተሠራ ውብ ባህላዊ መሶብ',
    description: 'Masterfully woven from dried mountain grass, reed stems, and naturally dyed palm fibers in traditional vibrant geometric patterns. Features a tall conical lid, sturdy pedestal base, and serves as an authentic dining centerpiece.',
    price: 620000, // 6,200.00 ETB
    category: 'Handmade Crafts',
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 7,
    seller: {
      _id: 'seller-03',
      name: 'Etege Cultural Artisan Hub',
      location: 'Piazza, Addis Ababa',
    },
    rating: 4.7,
    reviewsCount: 29,
    badge: 'Hand Woven',
  },
  {
    _id: 'eth-prod-006',
    name: 'Pure Sun-Dried Organic Berbere Blend (የተፈጨ ንፁህ የጓያ በርበሬ)',
    amharicName: 'በጥንቃቄ የተዘጋጀ ንፁህ የቤት በርበሬ',
    description: 'Secret family heirloom recipe featuring sun-dried Mareko Fana red chili peppers, korarima (black cardamom), sacred mountain basil (Besobila), ginger, garlic, and rue. Unadulterated, deeply aromatic, and richly spiced. 1kg pouch.',
    price: 85000, // 850.00 ETB
    category: 'Coffee & Spices',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 60,
    seller: {
      _id: 'seller-05',
      name: 'Mama Almaz Organic Spices',
      location: 'Merkato Spice Market, Addis Ababa',
    },
    rating: 5.0,
    reviewsCount: 89,
    badge: 'Farm Fresh',
  },
  {
    _id: 'eth-prod-007',
    name: 'Handwoven Double-Layer Dorze Gabi (ባህላዊ የዶርዜ ጋቢ)',
    amharicName: 'የዶርዜ ባለ ሁለት ደርብ ንፁህ ጥጥ ጋቢ',
    description: 'Woven in the legendary Dorze artisan tradition from 100% Ethiopian hand-spun cotton. Ultra-soft, breathable, and remarkably insulating for chilly highland evenings. Adorned with delicate bordered fringe.',
    price: 480000, // 4,800.00 ETB
    category: 'Traditional Clothing',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 15,
    seller: {
      _id: 'seller-01',
      name: 'Tigist Habesha Couture',
      location: 'Shiro Meda, Addis Ababa',
    },
    rating: 4.8,
    reviewsCount: 31,
  },
  {
    _id: 'eth-prod-008',
    name: 'Sidama Highland Peaberry Dark Roast (የሲዳማ ቡና)',
    amharicName: 'የሲዳማ የተጠበሰ የቡና ፍሬ',
    description: 'Rare single-bean peaberry cherries hand-sorted from Sidama mountain estates. Roasted in small artisanal batches to accentuate decadent dark chocolate undertones, blackberry sweetness, and velvety crema.',
    price: 160000, // 1,600.00 ETB
    category: 'Coffee & Spices',
    images: [
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 30,
    seller: {
      _id: 'seller-02',
      name: 'Abebe Specialty Coffee Export',
      location: 'Bole, Addis Ababa',
    },
    rating: 4.9,
    reviewsCount: 52,
  },
  {
    _id: 'eth-prod-009',
    name: 'Axum Sterling Silver Filigree Cross Pendant (የአክሱም ብር መስቀል)',
    amharicName: 'የአክሱም የእጅ ጥበብ የብር መስቀል',
    description: 'Handcrafted solid 925 sterling silver cross inspired by the timeless stone obelisks and ecclesiastical carvings of historic Axum. Hand-chiseled with delicate filigree scrollwork. Includes genuine leather cord.',
    price: 350000, // 3,500.00 ETB
    category: 'Handmade Crafts',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475882-d2780e03e911?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 14,
    seller: {
      _id: 'seller-06',
      name: 'Northern Heritage Silversmiths',
      location: 'Axum / Addis Ababa',
    },
    rating: 4.9,
    reviewsCount: 24,
    badge: 'Pure 925 Silver',
  },
  {
    _id: 'eth-prod-010',
    name: 'Pristine Wollega White Mountain Honey (የወለጋ ተፈጥሯዊ ነጭ ማር)',
    amharicName: 'የወለጋ ንፁህ የተፈጥሮ ነጭ ማር',
    description: '100% pure raw white honey gathered from wild high-altitude blossoms in the unspoiled forests of Wollega. Naturally crystallized with a creamy, melt-in-your-mouth texture and delicate floral taste. 1kg glass jar.',
    price: 195000, // 1,950.00 ETB
    category: 'Food & Honey',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 25,
    seller: {
      _id: 'seller-07',
      name: 'Green Oromia Agro-Forestry',
      location: 'Nekemte / Addis Ababa',
    },
    rating: 5.0,
    reviewsCount: 76,
    badge: '100% Raw & Organic',
  },
  {
    _id: 'eth-prod-011',
    name: 'Ethiopian Highland Sheepskin Chelsea Boots (የቆዳ ጫማ)',
    amharicName: 'ከሀገር ውስጥ ቆዳ የተሠራ ወንድ ጫማ',
    description: 'Handcrafted premium Chelsea boots combining supple Ethiopian sheepskin lining with rugged vegetable-tanned bovine leather. Fitted with durable non-slip rubber soles and cushioned memory foam arches for all-day comfort.',
    price: 540000, // 5,400.00 ETB
    category: 'Leather Goods',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 16,
    seller: {
      _id: 'seller-04',
      name: 'Addis Leather Works',
      location: 'Merkato, Addis Ababa',
    },
    rating: 4.8,
    reviewsCount: 41,
  },
  {
    _id: 'eth-prod-012',
    name: 'Superfine Magna White Teff Grain (የማኛ ነጭ ጤፍ)',
    amharicName: 'የደብረ ብርሃን ምርጥ የማኛ ጤፍ',
    description: 'Premium quality Magna grade whole teff harvested from the volcanic fertile soils of Debre Berhan. Naturally 100% gluten-free, rich in iron and prebiotic fiber. Yields fluffy, sour-fermented, bubbly injera with an authentic golden tint. 10kg sack.',
    price: 320000, // 3,200.00 ETB
    category: 'Food & Honey',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 40,
    seller: {
      _id: 'seller-08',
      name: 'Debre Berhan Farmers Cooperative',
      location: 'Debre Berhan, Amhara',
    },
    rating: 4.9,
    reviewsCount: 65,
    badge: 'Purity Tested',
  },
];
