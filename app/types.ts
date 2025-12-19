
export enum ProductType {
  BIKE = 'BIKE',
  PART = 'PART',
  ACCESSORY = 'ACCESSORY'
}

export interface Product {
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
}

export interface RentalBike {
  id: string;
  name: string;
  type: string;
  pricePerDay: number;
  image: string;
  isAvailable: boolean;
}

export interface Auction {
  id: string;
  name: string;
  description: string;
  image: string;
  currentBid: number;
  minIncrement: number;
  startTime: number; // timestamp
  endTime: number; // timestamp
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  bidHistory: { user: string; amount: number; time: number }[];
  winner?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isApprovedForAuction: boolean;
  orderHistory: string[];
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  author: string;
}
