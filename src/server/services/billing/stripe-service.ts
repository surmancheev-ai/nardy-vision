import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | undefined;

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured. Add STRIPE_SECRET_KEY first.");
    this.name = "StripeNotConfiguredError";
  }
}

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }

  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}
