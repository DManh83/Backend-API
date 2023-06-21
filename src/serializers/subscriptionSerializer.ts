import Stripe from 'stripe';

export const stripePriceSerializer = (price: Stripe.Price) => ({
  id: price.id,
  currency: price.currency,
  product: price.product,
  recurring: price.recurring,
  unitAmount: price.unit_amount,
});
