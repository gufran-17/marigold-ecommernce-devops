// name, category, brand, price, discountPrice, stock, features, specs, colors [c1, c2]
const categories = [
  { name: 'Electronics', description: 'Phones, audio, wearables and everyday tech', colors: ['#0F4C5C', '#5FA8B8'] },
  { name: 'Fashion', description: 'Clothing, footwear and accessories for every day', colors: ['#7A2E3A', '#D98E9A'] },
  { name: 'Home & Kitchen', description: 'Cookware, appliances and home essentials', colors: ['#3F5D3A', '#A9C8A0'] },
  { name: 'Beauty & Care', description: 'Skincare, grooming and personal care', colors: ['#8A5A2B', '#E8C39A'] },
  { name: 'Sports & Fitness', description: 'Gear for training, running and outdoor fun', colors: ['#2F3E8F', '#8FA0F0'] },
  { name: 'Books & Stationery', description: 'Bestsellers, notebooks and desk supplies', colors: ['#5B3A78', '#BFA3D6'] },
];

const products = [
  ['Nova X5 Smartphone 128GB', 'Electronics', 'Zenta', 24999, 21999, 42, ['6.6 inch AMOLED display', '50MP dual camera', '5000mAh battery', '33W fast charging'], { Display: '6.6" AMOLED, 120Hz', Storage: '128GB', RAM: '8GB', Battery: '5000mAh', OS: 'Android 14' }],
  ['AirBeat Wireless Earbuds', 'Electronics', 'Sonique', 3499, 2299, 120, ['Active noise cancellation', '28 hours total playback', 'IPX4 sweat resistant', 'Touch controls'], { Driver: '10mm', Bluetooth: '5.3', Battery: '7h + 21h case', Charging: 'USB-C' }],
  ['Pulse Fit Smartwatch', 'Electronics', 'Zenta', 5999, 4499, 60, ['1.7 inch always-on display', 'Heart rate and SpO2', '100+ sport modes', '10 day battery'], { Display: '1.7" AMOLED', 'Water resistance': '5 ATM', Battery: '10 days', Compatibility: 'Android & iOS' }],
  ['BassMax Bluetooth Speaker', 'Electronics', 'Sonique', 2999, null, 8, ['20W stereo sound', '12 hour playtime', 'Waterproof IPX7', 'Built-in mic'], { Output: '20W', Bluetooth: '5.2', Battery: '12h', Weight: '540g' }],
  ['UltraSlim 15.6 Laptop i5', 'Electronics', 'Kestrel', 52990, 47990, 15, ['12th gen Core i5', '16GB DDR4 RAM', '512GB NVMe SSD', 'Full HD IPS display'], { Processor: 'Intel Core i5-1235U', RAM: '16GB', Storage: '512GB SSD', Display: '15.6" FHD IPS', Weight: '1.6kg' }],
  ['ProKey Mechanical Keyboard', 'Electronics', 'Kestrel', 3999, 3199, 35, ['Hot-swappable switches', 'RGB backlight', 'Compact 75% layout', 'Wired and wireless'], { Switches: 'Red linear', Layout: '75%', Connectivity: 'USB-C / Bluetooth', Keycaps: 'PBT' }],
  ['Classic Fit Cotton Shirt', 'Fashion', 'Urbanline', 1499, 999, 80, ['100% cotton', 'Regular fit', 'Machine washable', 'Available in 5 sizes'], { Material: '100% Cotton', Fit: 'Regular', Care: 'Machine wash', Sleeve: 'Full' }],
  ['Slim Stretch Denim Jeans', 'Fashion', 'Urbanline', 2499, 1749, 65, ['Stretch denim for comfort', 'Slim fit', 'Mid rise', 'Five pocket styling'], { Material: '98% Cotton, 2% Elastane', Fit: 'Slim', Rise: 'Mid', Care: 'Machine wash' }],
  ['CloudRun Running Shoes', 'Fashion', 'Stride', 4999, 3999, 48, ['Cushioned EVA midsole', 'Breathable mesh upper', 'Anti-slip outsole', 'Lightweight build'], { Upper: 'Mesh', Sole: 'EVA + rubber', Weight: '260g', Use: 'Running, gym' }],
  ['Everyday Canvas Backpack', 'Fashion', 'Trailmate', 1999, null, 30, ['25L capacity', 'Padded laptop sleeve', 'Water resistant fabric', 'Two side pockets'], { Capacity: '25L', Material: 'Canvas', 'Laptop fit': 'Up to 15.6"', Weight: '700g' }],
  ['Merino Wool Winter Jacket', 'Fashion', 'Nordic Co', 6999, 5499, 4, ['Warm merino blend', 'Windproof shell', 'Zip pockets', 'Packable hood'], { Material: 'Wool blend', Fit: 'Regular', Lining: 'Polyester', Care: 'Dry clean' }],
  ['Leather Bifold Wallet', 'Fashion', 'Kestrel', 1299, 899, 90, ['Genuine leather', '6 card slots', 'RFID protection', 'Slim profile'], { Material: 'Genuine leather', Slots: '6 cards + 2 notes', RFID: 'Yes' }],
  ['Non-stick Cookware Set 5 pc', 'Home & Kitchen', 'Hearthly', 4499, 3299, 26, ['Induction compatible', 'PFOA free coating', 'Heat resistant handles', 'Glass lids included'], { Pieces: '5', Material: 'Aluminium', Coating: 'Non-stick', 'Induction ready': 'Yes' }],
  ['Electric Kettle 1.8L', 'Home & Kitchen', 'Hearthly', 1699, 1199, 74, ['Stainless steel body', 'Auto shut-off', 'Boil-dry protection', '1500W fast boil'], { Capacity: '1.8L', Power: '1500W', Body: 'Stainless steel' }],
  ['AirCrisp Digital Air Fryer 4L', 'Home & Kitchen', 'Brioche', 7999, 5999, 20, ['Rapid air technology', '8 preset menus', 'Digital touch panel', 'Dishwasher safe basket'], { Capacity: '4L', Power: '1500W', Timer: '60 min', Presets: '8' }],
  ['Egyptian Cotton Bedsheet Set', 'Home & Kitchen', 'Softnest', 2999, 2199, 40, ['300 thread count', 'Fits queen size mattress', '2 pillow covers', 'Fade resistant'], { Size: 'Queen', 'Thread count': '300', Material: 'Cotton', Includes: '1 sheet + 2 covers' }],
  ['Ceramic Dinner Set 18 pc', 'Home & Kitchen', 'Softnest', 3499, null, 0, ['Microwave safe', 'Dishwasher safe', 'Scratch resistant glaze', 'Serves 6'], { Pieces: '18', Material: 'Ceramic', 'Serves': '6' }],
  ['Vitamin C Face Serum 30ml', 'Beauty & Care', 'Glowlab', 899, 649, 150, ['10% Vitamin C', 'Hyaluronic acid', 'Suitable for all skin types', 'Dermatologically tested'], { Volume: '30ml', 'Skin type': 'All', 'Key ingredient': 'Vitamin C 10%' }],
  ['Daily Sunscreen SPF 50', 'Beauty & Care', 'Glowlab', 599, null, 200, ['Broad spectrum PA++++', 'Lightweight, non-greasy', 'No white cast', 'Water resistant'], { SPF: '50', Volume: '50g', Finish: 'Matte' }],
  ['Beard Trimmer Pro', 'Beauty & Care', 'Brioche', 1999, 1499, 55, ['20 length settings', 'Titanium coated blades', '90 min cordless use', 'USB-C charging'], { Settings: '20', Battery: '90 min', Blade: 'Titanium' }],
  ['Herbal Shampoo 400ml', 'Beauty & Care', 'Softnest', 349, 279, 300, ['Sulphate free', 'With amla and shikakai', 'Reduces hair fall', 'For daily use'], { Volume: '400ml', Type: 'Herbal', 'Hair type': 'All' }],
  ['Anti-Slip Yoga Mat 6mm', 'Sports & Fitness', 'Stride', 1299, 799, 110, ['6mm cushioning', 'Non-slip texture', 'Carry strap included', 'Easy to clean'], { Thickness: '6mm', Size: '183 x 61 cm', Material: 'TPE' }],
  ['Adjustable Dumbbell Set 20kg', 'Sports & Fitness', 'IronHouse', 5499, 4499, 18, ['Adjustable weight plates', 'Anti-rust coating', 'Comfort grip handles', 'Includes carry case'], { Weight: '20kg', Material: 'Cast iron', Grip: 'Knurled' }],
  ['Trail Hiking Backpack 40L', 'Sports & Fitness', 'Trailmate', 3999, 2999, 22, ['40L capacity', 'Rain cover included', 'Ventilated back panel', 'Hydration ready'], { Capacity: '40L', Weight: '1.1kg', Material: 'Ripstop nylon' }],
  ['Insulated Steel Bottle 1L', 'Sports & Fitness', 'Trailmate', 999, 749, 140, ['Keeps drinks cold 24h', 'Keeps drinks hot 12h', 'Leak proof lid', 'BPA free'], { Capacity: '1L', Material: 'Stainless steel', Insulation: 'Double wall' }],
  ['The Quiet Compass (Paperback)', 'Books & Stationery', 'Lanternhouse', 499, 399, 85, ['Award winning novel', '336 pages', 'English', 'Paperback'], { Author: 'Meera Kapoor', Pages: '336', Language: 'English', Format: 'Paperback' }],
  ['Habits That Stick (Hardcover)', 'Books & Stationery', 'Lanternhouse', 699, 549, 60, ['Practical habit building', '280 pages', 'Illustrated', 'Hardcover'], { Author: 'Rohan Desai', Pages: '280', Language: 'English', Format: 'Hardcover' }],
  ['A5 Dotted Notebook Pack of 3', 'Books & Stationery', 'Papercraft', 549, null, 220, ['120 gsm paper', 'Lay-flat binding', 'Numbered pages', 'Pen loop'], { Size: 'A5', Pages: '192 each', Paper: '120 gsm', Pack: '3' }],
  ['Gel Pen Set 12 Colours', 'Books & Stationery', 'Papercraft', 299, 219, 3, ['Smooth 0.5mm tip', 'Quick dry ink', '12 vibrant colours', 'Comfort grip'], { Tip: '0.5mm', Colours: '12', Ink: 'Gel' }],
];

module.exports = { categories, products };
