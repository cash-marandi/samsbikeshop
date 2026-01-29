import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactSubmission from '@/models/ContactSubmission';

export async function GET() {
  try {
    await dbConnect();
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const submission = new ContactSubmission({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      appointmentDate: body.appointmentDate,
    });

    await submission.save();
    return NextResponse.json({ message: 'Contact form submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}