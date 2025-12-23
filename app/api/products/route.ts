import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { ProductType } from '@/app/types';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to validate product data for POST
function validateProductData(data: any) {
  const { name, description, price, image, type, brand, stock } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { isValid: false, message: 'Name is required and must be a non-empty string.' };
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return { isValid: false, message: 'Description is required and must be a non-empty string.' };
  }
  if (typeof price !== 'number' || price <= 0) {
    return { isValid: false, message: 'Price is required and must be a positive number.' };
  }
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { isValid: false, message: 'Image URL is required and must be a non-empty string.' };
  }
  if (!Object.values(ProductType).includes(type)) {
    return { isValid: false, message: `Invalid product type. Must be one of: ${Object.values(ProductType).join(', ')}.` };
  }
  if (!brand || typeof brand !== 'string' || brand.trim() === '') {
    return { isValid: false, message: 'Brand is required and must be a non-empty string.' };
  }
  if (typeof stock !== 'number' || stock < 0) {
    return { isValid: false, message: 'Stock is required and must be a non-negative number.' };
  }

  return { isValid: true };
}

// Helper function to validate product data for PATCH (partial updates)
function validatePartialProductData(data: any) {
  const updates: any = {};
  let isValid = true;
  let message = '';

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      isValid = false;
      message = 'Name must be a non-empty string.';
    } else {
      updates.name = data.name;
    }
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim() === '') {
      isValid = false;
      message = 'Description must be a non-empty string.';
    } else {
      updates.description = data.description;
    }
  }
  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price <= 0) {
      isValid = false;
      message = 'Price must be a positive number.';
    } else {
      updates.price = data.price;
    }
  }
  if (data.stock !== undefined) {
    if (typeof data.stock !== 'number' || data.stock < 0) {
      isValid = false;
      message = 'Stock must be a non-negative number.';
    } else {
      updates.stock = data.stock;
    }
  }
  if (data.type !== undefined) {
    if (!Object.values(ProductType).includes(data.type)) {
      isValid = false;
      message = `Invalid product type. Must be one of: ${Object.values(ProductType).join(', ')}.`;
    } else {
      updates.type = data.type;
    }
  }
  if (data.brand !== undefined) {
    if (typeof data.brand !== 'string' || data.brand.trim() === '') {
      isValid = false;
      message = 'Brand must be a non-empty string.';
    } else {
      updates.brand = data.brand;
    }
  }
  if (data.image !== undefined) {
    if (typeof data.image !== 'string' || data.image.trim() === '') {
      isValid = false;
      message = 'Image URL must be a non-empty string.';
    } else {
      updates.image = data.image;
    }
  }

  // Optional fields
  if (data.isSold !== undefined) updates.isSold = data.isSold;
  if (data.isSpecial !== undefined) updates.isSpecial = data.isSpecial;
  if (data.discount !== undefined) updates.discount = data.discount;

  return { isValid, message, updates };
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as ProductType;
    const brand = formData.get('brand') as string;
    const stock = parseInt(formData.get('stock') as string);
    const imageFile = formData.get('image') as File;

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload stream to Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_products' }, // Optional: organize uploads in a folder
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(new Error('Failed to upload image to Cloudinary.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    } else {
      return NextResponse.json({ message: 'Image file is required.' }, { status: 400 });
    }

    const productData = {
      name, description, price, image: imageUrl, type, brand, stock,
      isSold: false, // Default value
      isSpecial: false, // Default value
      discount: 0, // Default value
    };

    const { isValid, message } = validateProductData(productData);
    if (!isValid) {
      return NextResponse.json({ message }, { status: 400 });
    }

    const product = new Product(productData);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Add product API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products in API:', error); // Added detailed logging
    return NextResponse.json({ message: error.message || 'Error fetching products from database.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required for update.' }, { status: 400 });
    }

    const formData = await req.formData();
    const updates: { [key: string]: any } = {};
    let imageUrl: string | undefined;

    // Process image file if provided
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_products' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary product image update error:', error);
              return reject(new Error('Failed to upload new image to Cloudinary.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
      updates.image = imageUrl; // Add new image URL to updates
    } else if (formData.has('image') && formData.get('image') === '') {
      // If 'image' field is explicitly empty, user intends to remove existing image
      updates.image = '';
    }

    // Process other fields
    const fieldsToProcess = ['name', 'description', 'price', 'type', 'brand', 'stock', 'isSold', 'isSpecial', 'discount'];
    for (const field of fieldsToProcess) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'price' || field === 'discount') {
          updates[field] = parseFloat(value as string);
        } else if (field === 'stock') {
          updates[field] = parseInt(value as string);
        } else if (field === 'isSold' || field === 'isSpecial') {
          updates[field] = value === 'true'; // Convert string 'true'/'false' to boolean
        } else {
          updates[field] = value;
        }
      }
    }

    // Validate partial updates
    const { isValid, message, updates: validatedUpdates } = validatePartialProductData(updates);
    if (!isValid) {
      return NextResponse.json({ message }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: validatedUpdates },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error('Update product API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required for deletion.' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}