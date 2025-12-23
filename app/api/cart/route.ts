import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Cart, { ICartItem } from '@/models/Cart'; // Import ICartItem
import User from '@/models/User'; // We need User to find the user's ID

// GET user's cart
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
    if (!cart) {
      // If no cart, return an empty one
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to add/update item in cart
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { productId, quantity } = await req.json();
    if (!productId || !quantity) {
      return NextResponse.json({ message: 'Missing productId or quantity' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId: user._id });

    // If no cart, create one
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: ICartItem) => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.productId');

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE item from cart
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ message: 'Missing productId' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter((item: ICartItem) => item.productId.toString() !== productId);

    await cart.save();
    const populatedCart = await cart.populate('items.productId');

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
