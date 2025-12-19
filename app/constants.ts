import { Product, ProductType, RentalBike, Auction, User, NewsPost } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Trek Marlin 7',
    description: 'A high-performance mountain bike for trail riding.',
    price: 850,
    image: 'https://picsum.photos/seed/bike1/600/400',
    type: ProductType.BIKE,
    brand: 'Trek',
    isSold: false,
    isSpecial: true,
    discount: 10,
  },
  {
    id: 'p2',
    name: 'Shimano Ultegra Chain',
    description: 'Precision engineered chain for smooth shifting.',
    price: 45,
    image: 'https://picsum.photos/seed/part1/600/400',
    type: ProductType.PART,
    brand: 'Shimano',
    isSold: false,
  },
  {
    id: 'p3',
    name: 'Carbon Road Frameset',
    description: 'Ultra-lightweight carbon fiber frame.',
    price: 1200,
    image: 'https://picsum.photos/seed/part2/600/400',
    type: ProductType.PART,
    brand: 'Giant',
    isSold: true,
  },
  {
    id: 'p4',
    name: 'Bontrager Circuit Helmet',
    description: 'Safe and breathable helmet for road cyclists.',
    price: 95,
    image: 'https://picsum.photos/seed/acc1/600/400',
    type: ProductType.ACCESSORY,
    brand: 'Bontrager',
    isSold: false,
  },
];

export const MOCK_RENTALS: RentalBike[] = [
  {
    id: 'r1',
    name: 'City Cruiser',
    type: 'Hybrid',
    pricePerDay: 25,
    image: 'https://picsum.photos/seed/rent1/600/400',
    isAvailable: true,
  },
  {
    id: 'r2',
    name: 'Trail Blaster',
    type: 'Mountain',
    pricePerDay: 40,
    image: 'https://picsum.photos/seed/rent2/600/400',
    isAvailable: true,
  },
];

export const MOCK_AUCTIONS: Auction[] = [
  {
    id: 'a1',
    name: 'Vintage 1970s Peugeot Road Bike',
    description: 'A collector\'s item in pristine condition.',
    image: 'https://picsum.photos/seed/auc1/600/400',
    currentBid: 350,
    minIncrement: 20,
    startTime: Date.now() - 3600000,
    endTime: Date.now() + 7200000,
    status: 'LIVE',
    bidHistory: [
      { user: 'BikerBob', amount: 300, time: Date.now() - 2000000 },
      { user: 'CyclingFan', amount: 350, time: Date.now() - 500000 },
    ],
  },
  {
    id: 'a2',
    name: 'Limited Edition Carbon Wheelset',
    description: 'Only 50 units ever produced.',
    image: 'https://picsum.photos/seed/auc2/600/400',
    currentBid: 1200,
    minIncrement: 50,
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 172800000,
    status: 'UPCOMING',
    bidHistory: [],
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sam Owner',
    email: 'admin@samsbike.shop',
    role: 'ADMIN',
    isApprovedForAuction: true,
    orderHistory: [],
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    isApprovedForAuction: false,
    orderHistory: ['p1'],
  },
];

export const MOCK_NEWS: NewsPost[] = [
  {
    id: 'n1',
    title: 'Spring Tune-up Specials are Here!',
    content: 'Get your bike ready for the sunny days ahead with our discount packages.',
    date: '2024-03-20',
    image: 'https://picsum.photos/seed/news1/800/400',
    author: 'Sam',
  },
  {
    id: 'n2',
    title: 'New Shimano Inventory Arriving',
    content: 'We just stocked up on the latest components. Visit the shop to see more.',
    date: '2024-03-18',
    image: 'https://picsum.photos/seed/news2/800/400',
    author: 'Admin',
  },
];
