import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RentalBike from '@/models/RentalBike';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (ensure this is done once, e.g., globally or in a util)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// GET a single rental bike by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid rental bike ID' }, { status: 400 });
  }

  try {
    const rentalBike = await RentalBike.findById(id);
    if (!rentalBike) {
      return NextResponse.json({ message: 'Rental bike not found' }, { status: 404 });
    }
    return NextResponse.json(rentalBike, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching rental bike ${id}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

// PATCH (Update) a single rental bike by ID
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid rental bike ID' }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const type = formData.get('type') as string | null;
    const pricePerDay = formData.get('pricePerDay');
    const isAvailable = formData.get('isAvailable');
    const imageFile = formData.get('image') as File | null;
    const existingImage = formData.get('existingImage') as string | null; // For keeping current image if no new one

    const updateFields: { [key: string]: any } = {};
    if (name) updateFields.name = name;
    if (type) updateFields.type = type;
    if (pricePerDay) updateFields.pricePerDay = parseFloat(pricePerDay as string);
    if (isAvailable !== null) updateFields.isAvailable = isAvailable === 'true';

    let imageUrl: string | undefined;

    // Handle image update
    if (imageFile && imageFile.size > 0) {
      // Upload new image to Cloudinary
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve: any, reject: any) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_rentals' },
          (error: any, result: any) => {
            if (error) {
              reject(new Error('Failed to upload new rental image to Cloudinary.'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
      updateFields.image = imageUrl;
    } else if (existingImage) {
      // Keep existing image if no new file is provided but existing path is sent
      updateFields.image = existingImage;
    } else if (formData.has('image') && imageFile?.size === 0) {
        // If an empty file input was sent, it means the user cleared the image
        updateFields.image = '';
    }
    
    const updatedRentalBike = await RentalBike.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );

    if (!updatedRentalBike) {
      return NextResponse.json({ message: 'Rental bike not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRentalBike, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating rental bike ${id}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE a single rental bike by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid rental bike ID' }, { status: 400 });
  }

  try {
    const deletedRentalBike = await RentalBike.findByIdAndDelete(id);
    if (!deletedRentalBike) {
      return NextResponse.json({ message: 'Rental bike not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Rental bike deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting rental bike ${id}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
