import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { StripeNotConfiguredError } from "@/server/services/billing/stripe-service";
import { createCheckoutSession } from "@/server/use-cases/billing/create-checkout-session";

const checkoutSchema = z.object({
  productCode: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = checkoutSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid checkout payload." }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession({
      userId: session.user.id,
      productCode: payload.data.productCode,
      origin: new URL(request.url).origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout failed." },
      { status: 400 },
    );
  }
}
