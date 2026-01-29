
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all reviews for a specific product
export async function GET(req: NextRequest, { params }: any) {
  await dbConnect();
  const awaitedParams = await params;
  const productId = awaitedParams.id;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new review for a product
export async function POST(req: NextRequest, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  await dbConnect();
  const productId = params.id;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const { rating, comment } = await req.json();

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be a number between 1 and 5' }, { status: 400 });
    }
    if (typeof comment !== 'string' || comment.trim().length < 5 || comment.trim().length > 500) {
      return NextResponse.json({ message: 'Comment must be between 5 and 500 characters' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: user._id });
    if (existingReview) {
      return NextResponse.json({ message: 'You have already reviewed this product' }, { status: 409 });
    }

    const newReview = new Review({
      productId,
      userId: user._id,
      userName: user.name, // Store user's name at the time of review
      rating,
      comment,
    });

    await newReview.save();

    // Update product's average rating and review count
    const product = await Product.findById(productId);
    if (product) {
      const stats = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: '$productId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        product.averageRating = stats[0].averageRating;
        product.reviewCount = stats[0].reviewCount;
      } else {
        product.averageRating = 0;
        product.reviewCount = 0;
      }
      await product.save();
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error(`Error posting review for product ${productId}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
