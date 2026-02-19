import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RentalBike from '@/models/RentalBike';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET() {
  await dbConnect();
  try {
    const rentalBikes = await RentalBike.find().sort({ name: 1 });
    return NextResponse.json({ rentalBikes }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rental bikes:', error);
    return NextResponse.json({ error: 'Failed to fetch rental bikes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const pricePerDay = parseFloat(formData.get('pricePerDay') as string);
    const isAvailable = formData.get('isAvailable') === 'true' || true;

    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await new Promise((resolve: any, reject: any) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'samsbikeshop_rentals' },
            (error: any, result: any) => {
              if (error) {
                reject(new Error('Failed to upload rental image to Cloudinary.'));
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
        imageUrls.push(uploadResult.secure_url);
      }
    }

    if (imageUrls.length === 0) {
      imageUrls.push(`https://picsum.photos/seed/rental${Date.now()}/600/400`);
    }
    
    const rentalBike = new RentalBike({
      name,
      type,
      pricePerDay,
      images: imageUrls,
      isAvailable,
    });

    await rentalBike.save();
    return NextResponse.json({ rentalBike }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rental bike:', error);
    return NextResponse.json({ error: 'Failed to create rental bike' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const formData = await request.formData();
    const { id, isAvailable } = Object.fromEntries(formData.entries());

    if (!id || typeof isAvailable !== 'boolean') {
      return NextResponse.json({ message: 'ID and isAvailable are required.' }, { status: 400 });
    }

    const updatedRental = await RentalBike.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    if (!updatedRental) {
      return NextResponse.json({ message: 'Rental bike not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedRental, { status: 200 });
  } catch (error: any) {
    console.error('Update rental bike API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}