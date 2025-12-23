import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Auction from '@/models/Auction';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to validate auction data for POST
function validateAuctionData(data: any) {
  const { name, description, currentBid, minIncrement, startTime, endTime, image } = data;

  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Name is required and must be a string.' };
  }
  if (!description || typeof description !== 'string') {
    return { isValid: false, message: 'Description is required and must be a string.' };
  }
  if (typeof currentBid !== 'number' || currentBid <= 0) {
    return { isValid: false, message: 'Starting bid is required and must be a positive number.' };
  }
  if (typeof minIncrement !== 'number' || minIncrement <= 0) {
    return { isValid: false, message: 'Minimum increment is required and must be a positive number.' };
  }
  if (!(startTime instanceof Date) || isNaN(startTime.getTime()) || !(endTime instanceof Date) || isNaN(endTime.getTime())) {
    return { isValid: false, message: 'Start and end times are required and must be valid timestamps.' };
  }
  if (startTime >= endTime) {
    return { isValid: false, message: 'End time must be after start time.' };
  }
  if (!image || typeof image !== 'string') {
    return { isValid: false, message: 'Image URL is required and must be a string.' };
  }

  return { isValid: true };
}

// Helper function to validate auction data for PATCH (partial updates)
function validatePartialAuctionData(data: any) {
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
  if (data.currentBid !== undefined) {
    if (typeof data.currentBid !== 'number' || data.currentBid <= 0) {
      isValid = false;
      message = 'Current bid must be a positive number.';
    } else {
      updates.currentBid = data.currentBid;
    }
  }
  if (data.minIncrement !== undefined) {
    if (typeof data.minIncrement !== 'number' || data.minIncrement <= 0) {
      isValid = false;
      message = 'Minimum increment must be a positive number.';
    } else {
      updates.minIncrement = data.minIncrement;
    }
  }
  if (data.startTime !== undefined) {
    if (!(data.startTime instanceof Date) || isNaN(data.startTime.getTime())) {
      isValid = false;
      message = 'Start time must be a valid timestamp.';
    } else {
      updates.startTime = data.startTime;
    }
  }
  if (data.endTime !== undefined) {
    if (!(data.endTime instanceof Date) || isNaN(data.endTime.getTime())) {
      isValid = false;
      message = 'End time must be a valid timestamp.';
    } else {
      updates.endTime = data.endTime;
    }
  }
  if (updates.startTime !== undefined && updates.endTime !== undefined && updates.startTime >= updates.endTime) {
    isValid = false;
    message = 'End time must be after start time.';
  } else if (updates.startTime === undefined && data.endTime !== undefined) {
    // If only endTime is updated, check against existing startTime (if available)
    // This requires fetching the existing auction, so handle this logic in the handler
  } else if (updates.endTime === undefined && data.startTime !== undefined) {
    // If only startTime is updated, check against existing endTime (if available)
    // This requires fetching the existing auction, so handle this logic in the handler
  }


  if (data.image !== undefined) {
    if (typeof data.image !== 'string' || data.image.trim() === '') {
      isValid = false;
      message = 'Image URL must be a non-empty string.';
    } else {
      updates.image = data.image;
    }
  }
  // Optional updates for status, bidHistory, winner
  if (data.status !== undefined) updates.status = data.status;
  if (data.bidHistory !== undefined) updates.bidHistory = data.bidHistory;
  if (data.winner !== undefined) updates.winner = data.winner;


  return { isValid, message, updates };
}


export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const currentBid = parseFloat(formData.get('currentBid') as string);
    const minIncrement = parseFloat(formData.get('minIncrement') as string);
    const startTime = new Date(parseInt(formData.get('startTime') as string, 10));
    const endTime = new Date(parseInt(formData.get('endTime') as string, 10));
    const imageFile = formData.get('image') as File;

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_auctions' }, // Optional: organize uploads in a folder
          (error, result) => {
            if (error) {
              console.error('Cloudinary auction image upload error:', error);
              return reject(new Error('Failed to upload image to Cloudinary.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    } else {
      return NextResponse.json({ message: 'Auction image is required.' }, { status: 400 });
    }

    const auctionData = {
      name, description, currentBid, minIncrement, startTime, endTime, image: imageUrl,
      status: 'UPCOMING', // Default status for new auctions
      bidHistory: [],
    };

    const { isValid, message } = validateAuctionData(auctionData);
    if (!isValid) {
      return NextResponse.json({ message }, { status: 400 });
    }

    const auction = new Auction(auctionData);
    await auction.save();
    return NextResponse.json(auction, { status: 201 });
  } catch (error: any) {
    console.error('Create auction API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const search = searchParams.get('search'); // For general search functionality

    let query: any = {};
    if (category && category !== 'all') { // Assuming 'all' means no category filter
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions: any = {};
    switch (sortBy) {
      case 'endingSoon':
        sortOptions.endTime = 1; // Ascending
        break;
      case 'newest':
        sortOptions.createdAt = -1; // Descending
        break;
      case 'priceAsc':
        sortOptions.currentBid = 1; // Ascending
        break;
      case 'priceDesc':
        sortOptions.currentBid = -1; // Descending
        break;
      default:
        sortOptions.createdAt = -1; // Default sort
        break;
    }

    const auctions = await Auction.find(query).sort(sortOptions);
    return NextResponse.json(auctions, { status: 200 });
  } catch (error: any) {
    console.error('Fetch auctions API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Auction ID is required for update.' }, { status: 400 });
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
          { folder: 'samsbikeshop_auctions' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary auction image update error:', error);
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
    const fieldsToProcess = ['name', 'description', 'currentBid', 'minIncrement', 'startTime', 'endTime', 'status', 'winner']; // Removed image as it's handled above
    for (const field of fieldsToProcess) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'currentBid' || field === 'minIncrement') {
          updates[field] = parseFloat(value as string);
        } else if (field === 'startTime' || field === 'endTime') {
          updates[field] = parseInt(value as string);
        } else {
          updates[field] = value;
        }
      }
    }

    // Special validation for start/end times if both are present in updates
    if (updates.startTime !== undefined && updates.endTime !== undefined && updates.startTime >= updates.endTime) {
      return NextResponse.json({ message: 'End time must be after start time.' }, { status: 400 });
    } else if (updates.startTime === undefined && updates.endTime !== undefined) {
      // If only endTime is updated, check against existing startTime
      const existingAuction = await Auction.findById(id);
      if (existingAuction && existingAuction.startTime >= updates.endTime) {
        return NextResponse.json({ message: 'End time must be after existing start time.' }, { status: 400 });
      }
    } else if (updates.endTime === undefined && updates.startTime !== undefined) {
      // If only startTime is updated, check against existing endTime
      const existingAuction = await Auction.findById(id);
      if (existingAuction && updates.startTime >= existingAuction.endTime) {
        return NextResponse.json({ message: 'Start time must be before existing end time.' }, { status: 400 });
      }
    }


    // Validate partial updates using the helper function (or similar logic)
    const { isValid, message } = validatePartialAuctionData(updates);
    if (!isValid) {
      return NextResponse.json({ message }, { status: 400 });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedAuction) {
      return NextResponse.json({ message: 'Auction not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedAuction, { status: 200 });
  } catch (error: any) {
    console.error('Update auction API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Auction ID is required for deletion.' }, { status: 400 });
    }

    const deletedAuction = await Auction.findByIdAndDelete(id);

    if (!deletedAuction) {
      return NextResponse.json({ message: 'Auction not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Auction deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete auction API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
