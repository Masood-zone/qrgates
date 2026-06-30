import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { initializePayment, PaystackError } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    // Validate the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize payment with Paystack
    const paymentData = {
      email: user.email,
      amount: order.total,
      metadata: {
        orderId: order.id,
        userId: user.id,
        eventId: order.eventId,
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/verify`,
    };

    const paymentResponse = await initializePayment(paymentData);

    if (!paymentResponse || !paymentResponse.authorization_url) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.authorization_url,
      reference: paymentResponse.reference,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    if (error instanceof PaystackError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status && error.status >= 400 ? error.status : 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
