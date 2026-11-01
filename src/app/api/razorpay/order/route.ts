import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Amount should be in paise (smallest currency unit). 
    // INR 100 = 10000 paise
    const amount = (course.discountPrice || course.price) * 100; 

    // Use dummy keys if environment variables are not set yet to prevent crashing at startup.
    const key_id = process.env.RAZORPAY_KEY_ID || 'dummy_key';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount), // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${courseId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ order, key_id }, { status: 200 });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
