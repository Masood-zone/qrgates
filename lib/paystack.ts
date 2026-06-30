import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL =
  process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const PAYSTACK_TRANSACTION_URL = PAYSTACK_BASE_URL.replace(/\/$/, "").endsWith(
  "/transaction",
)
  ? PAYSTACK_BASE_URL.replace(/\/$/, "")
  : `${PAYSTACK_BASE_URL.replace(/\/$/, "")}/transaction`;

interface InitializePaymentProps {
  email: string;
  amount: number; // in pesewas (100 = 1 GHS)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export class PaystackError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PaystackError";
    this.status = status;
  }
}

function getPaystackErrorMessage(error: unknown, fallback: string) {
  if (error instanceof PaystackError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  if (axios.isAxiosError(error)) {
    const message =
      typeof error.response?.data === "object" &&
      error.response.data &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : fallback;

    return {
      message,
      status: error.response?.status,
    };
  }

  return { message: fallback, status: undefined };
}

function getPaystackHeaders() {
  if (!PAYSTACK_SECRET_KEY) {
    throw new PaystackError("Paystack secret key is not configured", 500);
  }

  return {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

interface VerifyPaymentResponse {
  id: number;
  status: string;
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  metadata: Record<string, any>;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export async function initializePayment({
  email,
  amount,
  reference,
  callbackUrl,
  metadata,
}: InitializePaymentProps): Promise<InitializePaymentResponse> {
  try {
    const response = await axios.post<
      PaystackResponse<InitializePaymentResponse>
    >(
      `${PAYSTACK_TRANSACTION_URL}/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert GHS to pesewas.
        reference,
        callback_url: callbackUrl,
        metadata,
      },
      {
        headers: getPaystackHeaders(),
      },
    );

    return response.data.data;
  } catch (error) {
    const { message, status } = getPaystackErrorMessage(
      error,
      "Failed to initialize payment",
    );
    console.error("Paystack initialize payment error:", { status, message });
    throw new PaystackError(message, status);
  }
}

export async function verifyPayment(
  reference: string,
): Promise<VerifyPaymentResponse> {
  try {
    const response = await axios.get<PaystackResponse<VerifyPaymentResponse>>(
      `${PAYSTACK_TRANSACTION_URL}/verify/${reference}`,
      {
        headers: getPaystackHeaders(),
      },
    );

    //Send an email notification to the user
    // if (response.data.status && response.data.data.status === "success") {
    //   const paymentData = response.data.data;
    //   // Here you can send an email notification to the user
    //   // For example, using a mail service like nodemailer
    //   await transporter.sendMail({
    //     from: `"QuickGates" <${process.env.EMAIL_USER}>`,
    //     to: paymentData.customer.email,
    //     subject: "Payment Successful",
    //     html: purchaseConfirmationEmail({
    //       name: paymentData.customer.first_name,
    //       eventTitle: paymentData.metadata.eventTitle,
    //       eventDate: paymentData.metadata.eventDate,
    //       eventLocation: paymentData.metadata.eventLocation,
    //       ticketType: paymentData.metadata.ticketType,
    //       ticketNumber: paymentData.metadata.ticketNumber,
    //       qrCodeUrl: paymentData.metadata.qrCodeUrl,
    //     }),
    //   });
    // } else {
    //   console.error("Payment verification failed:", response.data.message);
    //   // Send an email notification for failed payment
    //   await transporter.sendMail({
    //     from: `"QuickGates" <${process.env.EMAIL_USER}>`,
    //     to: response.data.data.customer.email,
    //     subject: "Payment Failed",
    //     html: purchaseFailureEmail({
    //       name: response.data.data.customer.first_name,
    //       eventTitle: response.data.data.metadata.eventTitle,
    //       supportEmail:
    //         process.env.SUPPORT_EMAIL || "<support_email@example.com>",
    //     }),
    //   });
    // }

    return response.data.data;
  } catch (error) {
    const { message, status } = getPaystackErrorMessage(
      error,
      "Failed to verify payment",
    );
    console.error("Paystack verify payment error:", { status, message });
    throw new PaystackError(message, status);
  }
}
