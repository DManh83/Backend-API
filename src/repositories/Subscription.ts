import Stripe from 'stripe';

import env from '../../config/env';
import SubscriptionModel from '../models/Subscription';

const stripe = new Stripe(env.stripeSecretKey as string, { apiVersion: '2020-08-27' });

class SubscriptionRepository {
  getPricesWithProduct = async () => stripe.prices.list({ expand: ['data.product'] });

  getSubscriptionByUserId = async (userId: string) => SubscriptionModel.findOne({ where: { userId }, order: [['created_at', 'DESC']] });

  getSubscriptionBySubscriptionId = async (subscriptionId: string) =>
    SubscriptionModel.findOne({ where: { subscriptionId }, order: [['created_at', 'DESC']] });
}

export default new SubscriptionRepository();
