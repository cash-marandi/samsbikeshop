
export enum ProductType {
  BIKE = 'BIKE',
  PART = 'PART',
  ACCESSORY = 'ACCESSORY'
}

export enum UserRole {
  TEAM_ADMIN = 'TEAM_ADMIN',
  USER = 'USER',
  EDITOR = 'EDITOR', // Added for potential future team roles
  VIEWER = 'VIEWER', // Added for potential future team roles
}

export interface Product {
  _id?: string; // Add _id for MongoDB compatibility
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: ProductType;
  brand: string;
  isSold: boolean;
  isSpecial?: boolean;
  discount?: number;
  stock: number;
}

export interface RentalBike {
  id: string;
  name: string;
  type: string;
  pricePerDay: number;
  image: string;
  isAvailable: boolean;
}

export enum AuctionCategory {
  ROAD_BIKES = 'Road Bikes',
  MOUNTAIN_BIKES = 'Mountain Bikes',
  HYBRID_BIKES = 'Hybrid Bikes',
  ELECTRIC_BIKES = 'Electric Bikes',
  KIDS_BIKES = 'Kids Bikes',
  VINTAGE = 'Vintage',
  COMPONENTS = 'Components',
  ACCESSORIES = 'Accessories',
  OTHER = 'Other',
}

export interface Auction {
  _id?: string; // Add _id for MongoDB compatibility
  id: string;
  name: string;
  description: string;
  image: string;
  currentBid: number;
  minIncrement: number;
  startTime: number; // timestamp
  endTime: number; // timestamp
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  category: AuctionCategory; // Add category to Auction interface
  bidHistory: { user: {id: string, name: string}; amount: number; time: number }[]; // user will be populated
  winner?: string; // winner will be user id
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApprovedForAuction: boolean;
  orderHistory: string[];
  watchlist: string[]; // Watchlist is an array of Auction IDs (strings)
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  author: string;
}

export interface TeamMember {
  _id?: string; // Add _id for MongoDB compatibility
  id: string; // Assuming id will be a string on frontend
  name: string;
  email: string;
  role: UserRole; // Assuming UserRole is imported
  image: string; // image URL for the team member
  // Note: Password should not be exposed on the frontend
}
