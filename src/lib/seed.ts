import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const categories = [
  { name: 'Grocery & Staples', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg' },
  { name: 'Packaged Food', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266109_15-maggi-2-minute-instant-noodles-masala.jpg' },
  { name: 'Dairy & Frozen', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/1204434_1-amul-taaza-fresh-toned-milk.jpg' },
  { name: 'Beverages', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/251023_11-coca-cola-soft-drink.jpg' },
  { name: 'Personal Care', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40006988_8-dove-cream-beauty-bathing-bar.jpg' },
  { name: 'Home Care & Cleaning', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266964_22-surf-excel-easy-wash-detergent-powder.jpg' },
  { name: 'Kitchen & Household', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40002241_13-vim-dishwash-bar.jpg' },
  { name: 'Home & Furnishing', imageURL: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800' },
  { name: 'Clothing & Apparel', imageURL: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800' },
  { name: 'Baby Care', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40001223_10-johnsons-baby-powder.jpg' },
  { name: 'Pet Supplies', imageURL: 'https://www.bigbasket.com/media/uploads/p/l/100155_11-pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs.jpg' },
  { name: 'Fruits & Vegetables', imageURL: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800' },
  { name: 'General Merchandise', imageURL: 'https://images.unsplash.com/photo-1583484963886-cfe2bef37f7b?auto=format&fit=crop&q=80&w=800' }
];

const products = [
  // 1. Grocery & Staples
  {
    name: 'Aashirvaad Superior MP Atta',
    description: 'Aashirvaad Superior MP Atta is made from the grains which are heavy on the palm, golden amber in colour and hard in bite.',
    price: 420,
    discount: 8,
    brand: 'Aashirvaad',
    category: 'Grocery & Staples',
    unit: '5 kg',
    stock: 150,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg',
    ecoScore: 9
  },
  {
    name: 'Fortune Sunlite Refined Sunflower Oil',
    description: 'Fortune Sunlite Refined Sunflower Oil is a healthy and nutritious oil. It is rich in vitamins and contains no cholesterol.',
    price: 165,
    discount: 5,
    brand: 'Fortune',
    category: 'Grocery & Staples',
    unit: '1 L',
    stock: 100,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/274145_14-fortune-sunlite-refined-sunflower-oil.jpg',
    ecoScore: 7
  },
  {
    name: 'Tata Salt',
    description: 'Tata Salt is the pioneer of iodized salt in India. It is vacuum evaporated and contains the right amount of iodine.',
    price: 28,
    discount: 0,
    brand: 'Tata',
    category: 'Grocery & Staples',
    unit: '1 kg',
    stock: 500,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/241600_5-tata-salt-iodized.jpg',
    ecoScore: 8
  },
  {
    name: 'Daawat Rozana Gold Basmati Rice',
    description: 'Daawat Rozana Gold is the finest Basmati rice in the mid-price segment. It is specially aged to help every grain of rice to puff up.',
    price: 395,
    discount: 15,
    brand: 'Daawat',
    category: 'Grocery & Staples',
    unit: '5 kg',
    stock: 80,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40044731_11-daawat-basmati-rice-rozana-gold.jpg',
    ecoScore: 8
  },
  {
    name: 'Tata Sampann Unpolished Toor Dal',
    description: 'Tata Sampann Toor Dal is unpolished as it does not undergo any artificial polishing with water, oil or leather.',
    price: 185,
    discount: 10,
    brand: 'Tata Sampann',
    category: 'Grocery & Staples',
    unit: '1 kg',
    stock: 120,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40000291_10-tata-sampann-unpolished-toor-dal.jpg',
    ecoScore: 9
  },

  // 2. Packaged Food
  {
    name: 'Maggi 2-Minute Masala Noodles',
    description: 'MAGGI Masala Noodles is an instant noodles brand manufactured by Nestle. It is made with the finest quality spices and ingredients.',
    price: 168,
    discount: 10,
    brand: 'Nestle',
    category: 'Packaged Food',
    unit: '560 g',
    stock: 300,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266109_15-maggi-2-minute-instant-noodles-masala.jpg',
    ecoScore: 5
  },
  {
    name: 'Kelloggs Corn Flakes',
    description: 'Kelloggs Corn Flakes is a nourishing and wholesome breakfast at its best. It is prepared from corn and is enriched with iron and vitamins.',
    price: 345,
    discount: 12,
    brand: 'Kelloggs',
    category: 'Packaged Food',
    unit: '875 g',
    stock: 60,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/102871_12-kelloggs-corn-flakes.jpg',
    ecoScore: 7
  },
  {
    name: 'Britannia Good Day Cashew Cookies',
    description: 'Britannia Good Day Cashew Cookies are delicious butter cookies with a hint of cashew. Perfect for tea time.',
    price: 120,
    discount: 20,
    brand: 'Britannia',
    category: 'Packaged Food',
    unit: '600 g',
    stock: 200,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/102102_4-britannia-good-day-cashew-cookies.jpg',
    ecoScore: 6
  },
  {
    name: 'Kissan Fresh Tomato Ketchup',
    description: 'Kissan Fresh Tomato Ketchup is made from 100% real tomatoes. It is a perfect accompaniment for snacks.',
    price: 145,
    discount: 5,
    brand: 'Kissan',
    category: 'Packaged Food',
    unit: '950 g',
    stock: 100,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/10000126_16-kissan-fresh-tomato-ketchup.jpg',
    ecoScore: 6
  },

  // 3. Dairy & Frozen
  {
    name: 'Amul Taaza Fresh Toned Milk',
    description: 'Amul Taaza is fresh milk which is pasteurized and homogenized. It is rich in calcium and protein.',
    price: 540,
    discount: 0,
    brand: 'Amul',
    category: 'Dairy & Frozen',
    unit: '10 x 1 L',
    stock: 100,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/1204434_1-amul-taaza-fresh-toned-milk.jpg',
    ecoScore: 8
  },
  {
    name: 'Amul Butter - Pasteurized',
    description: 'Amul Butter is made from fresh cream and has a delicious taste. It is a must-have for every kitchen.',
    price: 255,
    discount: 2,
    brand: 'Amul',
    category: 'Dairy & Frozen',
    unit: '500 g',
    stock: 150,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/104864_12-amul-butter-pasteurised.jpg',
    ecoScore: 7
  },
  {
    name: 'McCain Smiles - Crispy Potato Snacks',
    description: 'McCain Smiles are delicious crispy potato snacks in the shape of smiles. Perfect for kids.',
    price: 135,
    discount: 10,
    brand: 'McCain',
    category: 'Dairy & Frozen',
    unit: '415 g',
    stock: 80,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/240100_9-mccain-smiles-crispy-potato-snacks.jpg',
    ecoScore: 5
  },

  // 4. Beverages
  {
    name: 'Coca-Cola Soft Drink',
    description: 'Coca-Cola is a carbonated soft drink. It is the worlds most popular and biggest-selling soft drink.',
    price: 95,
    discount: 10,
    brand: 'Coca-Cola',
    category: 'Beverages',
    unit: '1.75 L',
    stock: 150,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/251023_11-coca-cola-soft-drink.jpg',
    ecoScore: 4
  },
  {
    name: 'Red Label Tea',
    description: 'Brooke Bond Red Label Tea is a blend of high-quality tea leaves. It has a rich taste and aroma.',
    price: 580,
    discount: 5,
    brand: 'Red Label',
    category: 'Beverages',
    unit: '1 kg',
    stock: 120,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266534_18-brooke-bond-red-label-tea.jpg',
    ecoScore: 8
  },
  {
    name: 'Nescafe Classic Instant Coffee',
    description: 'Nescafe Classic is 100% pure instant coffee. It is made from high-quality coffee beans.',
    price: 320,
    discount: 8,
    brand: 'Nescafe',
    category: 'Beverages',
    unit: '100 g',
    stock: 200,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266579_25-nescafe-classic-instant-coffee.jpg',
    ecoScore: 7
  },

  // 5. Personal Care
  {
    name: 'Dove Cream Beauty Bathing Bar',
    description: 'Dove Cream Beauty Bathing Bar combines a gentle cleansing formula with Doves signature 1/4 moisturizing cream.',
    price: 245,
    discount: 15,
    brand: 'Dove',
    category: 'Personal Care',
    unit: '3 x 125 g',
    stock: 150,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40006988_8-dove-cream-beauty-bathing-bar.jpg',
    ecoScore: 6
  },
  {
    name: 'Colgate Strong Teeth Toothpaste',
    description: 'Colgate Strong Teeth is Indias No.1 Toothpaste. It has Amino Shakti which helps add natural calcium to your teeth.',
    price: 210,
    discount: 10,
    brand: 'Colgate',
    category: 'Personal Care',
    unit: '500 g',
    stock: 250,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/1200125_10-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti.jpg',
    ecoScore: 7
  },
  {
    name: 'Head & Shoulders Anti-Dandruff Shampoo',
    description: 'Head & Shoulders Anti-Dandruff Shampoo helps to remove dandruff and keep your scalp healthy.',
    price: 450,
    discount: 12,
    brand: 'Head & Shoulders',
    category: 'Personal Care',
    unit: '650 ml',
    stock: 100,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40001334_12-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg',
    ecoScore: 6
  },

  // 6. Home Care & Cleaning
  {
    name: 'Surf Excel Easy Wash Detergent Powder',
    description: 'Surf Excel Easy Wash Detergent Powder is a superfine powder that dissolves easily and removes tough stains fast.',
    price: 540,
    discount: 12,
    brand: 'Surf Excel',
    category: 'Home Care & Cleaning',
    unit: '3 kg',
    stock: 90,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/266964_22-surf-excel-easy-wash-detergent-powder.jpg',
    ecoScore: 5
  },
  {
    name: 'Vim Dishwash Bar',
    description: 'Vim Dishwash Bar is the first dishwash bar in India. It has the power of 100 lemons which helps clean tough grease.',
    price: 60,
    discount: 5,
    brand: 'Vim',
    category: 'Home Care & Cleaning',
    unit: '3 x 200 g',
    stock: 400,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40002241_13-vim-dishwash-bar.jpg',
    ecoScore: 6
  },
  {
    name: 'Harpic Disinfectant Toilet Cleaner',
    description: 'Harpic Disinfectant Toilet Cleaner kills 99.9% of germs and removes tough stains.',
    price: 185,
    discount: 10,
    brand: 'Harpic',
    category: 'Home Care & Cleaning',
    unit: '1 L',
    stock: 150,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/1200163_4-harpic-disinfectant-toilet-cleaner-liquid-original.jpg',
    ecoScore: 5
  },

  // 7. Kitchen & Household
  {
    name: 'Milton Thermosteel Bottle',
    description: 'Milton Thermosteel Bottle keeps your beverages hot or cold for 24 hours.',
    price: 850,
    discount: 15,
    brand: 'Milton',
    category: 'Kitchen & Household',
    unit: '1 L',
    stock: 50,
    imageURL: 'https://images.unsplash.com/photo-1602143399344-ee81f9adef10?auto=format&fit=crop&q=80&w=800',
    ecoScore: 9
  },
  {
    name: 'Prestige Omega Deluxe Cookware Set',
    description: 'Prestige Omega Deluxe Cookware Set is made of high-quality non-stick material.',
    price: 2450,
    discount: 20,
    brand: 'Prestige',
    category: 'Kitchen & Household',
    unit: 'Set of 3',
    stock: 30,
    imageURL: 'https://images.unsplash.com/photo-1584990344321-27682ad0f244?auto=format&fit=crop&q=80&w=800',
    ecoScore: 8
  },

  // 8. Home & Furnishing
  {
    name: 'Bombay Dyeing Cotton Bedsheet',
    description: 'Bombay Dyeing Cotton Bedsheet is made of 100% pure cotton and has a beautiful design.',
    price: 1250,
    discount: 15,
    brand: 'Bombay Dyeing',
    category: 'Home & Furnishing',
    unit: 'Double Bed',
    stock: 40,
    imageURL: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    ecoScore: 9
  },
  {
    name: 'Raymond Home Luxury Towel Set',
    description: 'Raymond Home Luxury Towel Set is made of high-quality cotton and is very soft.',
    price: 850,
    discount: 10,
    brand: 'Raymond',
    category: 'Home & Furnishing',
    unit: 'Set of 2',
    stock: 60,
    imageURL: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=800',
    ecoScore: 8
  },

  // 9. Clothing & Apparel
  {
    name: 'Mens Cotton Polo T-Shirt',
    description: 'Mens Cotton Polo T-Shirt is made of high-quality cotton and is very comfortable.',
    price: 750,
    discount: 20,
    brand: 'SmartMart',
    category: 'Clothing & Apparel',
    unit: 'L',
    stock: 100,
    imageURL: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    ecoScore: 7
  },
  {
    name: 'Womens Floral Print Kurti',
    description: 'Womens Floral Print Kurti is made of high-quality rayon and has a beautiful design.',
    price: 950,
    discount: 15,
    brand: 'SmartMart',
    category: 'Clothing & Apparel',
    unit: 'M',
    stock: 80,
    imageURL: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    ecoScore: 7
  },

  // 10. Baby Care
  {
    name: 'Pampers Baby-Dry Diapers',
    description: 'Pampers Baby-Dry Diapers provide up to 12 hours of dryness for your baby.',
    price: 1150,
    discount: 10,
    brand: 'Pampers',
    category: 'Baby Care',
    unit: 'Pack of 64',
    stock: 50,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/40001223_10-johnsons-baby-powder.jpg',
    ecoScore: 5
  },
  {
    name: 'Himalaya Baby Lotion',
    description: 'Himalaya Baby Lotion helps to keep your babys skin soft and healthy.',
    price: 250,
    discount: 5,
    brand: 'Himalaya',
    category: 'Baby Care',
    unit: '400 ml',
    stock: 100,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/10000126_16-kissan-fresh-tomato-ketchup.jpg',
    ecoScore: 8
  },

  // 11. Pet Supplies
  {
    name: 'Pedigree Dry Dog Food',
    description: 'Pedigree Dry Dog Food provides complete and balanced nutrition for your adult dog.',
    price: 650,
    discount: 10,
    brand: 'Pedigree',
    category: 'Pet Supplies',
    unit: '3 kg',
    stock: 40,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/100155_11-pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs.jpg',
    ecoScore: 6
  },
  {
    name: 'Whiskas Dry Cat Food',
    description: 'Whiskas Dry Cat Food provides complete and balanced nutrition for your adult cat.',
    price: 450,
    discount: 5,
    brand: 'Whiskas',
    category: 'Pet Supplies',
    unit: '1.2 kg',
    stock: 60,
    imageURL: 'https://www.bigbasket.com/media/uploads/p/l/100155_11-pedigree-dry-dog-food-chicken-vegetables-for-adult-dogs.jpg',
    ecoScore: 6
  },

  // 12. Fruits & Vegetables
  {
    name: 'Fresh Alphonso Mangoes',
    description: 'Sweet and juicy Ratnagiri Alphonso mangoes, pack of 6.',
    price: 600,
    discount: 15,
    brand: 'FarmFresh',
    category: 'Fruits & Vegetables',
    unit: '6 pcs',
    stock: 20,
    imageURL: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800',
    ecoScore: 10
  },
  {
    name: 'Organic Broccoli',
    description: 'Fresh and organic broccoli, rich in vitamins and minerals.',
    price: 80,
    discount: 0,
    brand: 'FarmFresh',
    category: 'Fruits & Vegetables',
    unit: '500 g',
    stock: 50,
    imageURL: 'https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&q=80&w=800',
    ecoScore: 10
  },

  // 13. General Merchandise
  {
    name: 'Parker Vector Roller Ball Pen',
    description: 'Parker Vector Roller Ball Pen has a sleek design and provides a smooth writing experience.',
    price: 250,
    discount: 10,
    brand: 'Parker',
    category: 'General Merchandise',
    unit: '1 pc',
    stock: 100,
    imageURL: 'https://images.unsplash.com/photo-1583484963886-cfe2bef37f7b?auto=format&fit=crop&q=80&w=800',
    ecoScore: 7
  },
  {
    name: 'Hot Wheels Die-Cast Car',
    description: 'Hot Wheels Die-Cast Car is a high-quality toy car for kids.',
    price: 150,
    discount: 0,
    brand: 'Hot Wheels',
    category: 'General Merchandise',
    unit: '1 pc',
    stock: 200,
    imageURL: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=800',
    ecoScore: 5
  }
];

export async function seedData() {
  try {
    // Seed Categories
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of categories) {
        await addDoc(collection(db, 'categories'), cat);
      }
      console.log('Categories seeded');
    }

    // Seed Products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      for (const prod of products) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: new Date().toISOString()
        });
      }
      console.log('Products seeded');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
