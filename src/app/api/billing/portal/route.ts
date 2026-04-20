import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeNotConfiguredError } from "@/server/services/billing/stripe-service";
import { createCustomerPortalSession } from "@/server/use-cases/billing/create-customer-portal-session";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await createCustomerPortalSession({
      userId: session.user.id,
      origin: new URL(request.url).origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Portal session failed." },
      { status: 400 },
    );
  }
}
