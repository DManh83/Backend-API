import dayjs from 'dayjs';
import { Request, Response } from 'express';
import Stripe from 'stripe';

import NotFoundError from '../common/errors/types/NotFoundError';
import response from '../common/helpers/response';
import messages from '../common/messages';
import {
  CreateAppleSubscription,
  CreateSubscriptionParams,
  SubscriptionStatus,
  UpdateSubscriptionParams,
} from '../interfaces/Subscription';
import SubscriptionModel from '../models/Subscription';
import SubscriptionRepository from '../repositories/Subscription';
import UserRepository from '../repositories/User';
import { stripePriceSerializer } from '../serializers/subscriptionSerializer';
import StripeServices from '../services/Subscription';

class StripeController extends StripeServices {
  public getPlanList = async (req: Request, res: Response) => {
    const prices = await SubscriptionRepository.getPricesWithProduct();

    response.success(
      res,
      prices.data.filter((price) => (price.product as any).active && price.active).map((price) => stripePriceSerializer(price))
    );
  };

  createSubscription = async (req: Request<{}, {}, CreateSubscriptionParams>, res: Response) => {
    const { user, body: params } = req;

    const existedUser = await UserRepository.getById(user.id);

    if (!existedUser) throw new NotFoundError(messages.user.notFound);

    const existedSubscription = await SubscriptionRepository.getSubscriptionByUserId(req.user.id);

    if (existedSubscription?.status === 'active') {
      await this.cancelSubscription(existedSubscription.subscriptionId);
    }

    if (params.paymentMethodId) {
      await this.updatePaymentMethod(existedUser, params.paymentMethodId);
    }
    const subscription = await this.createSubscriptionService(existedUser, params);

    response.success(res, {
      subscriptionId: subscription.id,
      clientSecret: ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret,
    });
  };

  createAppleSubscription = async (req: Request<{}, {}, CreateAppleSubscription>, res: Response) => {
    const { user, body: params } = req;

    const existedUser = await UserRepository.getById(user.id);

    if (!existedUser) throw new NotFoundError(messages.user.notFound);

    let existedSubscription = await SubscriptionRepository.getSubscriptionBySubscriptionId(params.subscriptionId);

    if (!existedSubscription) {
      await SubscriptionModel.destroy({
        where: {
          userId: user.id,
        },
      });
      existedSubscription = await SubscriptionModel.create({
        userId: user.id,
        record: params.record,
        subscriptionId: params.subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      });
    } else {
      existedSubscription.userId = user.id;
      existedSubscription.cancelAtPeriodEnd = false;
      if (dayjs(existedSubscription.currentPeriodEnd).diff(dayjs()) < 0) {
        existedSubscription.record = { ...params.record, productId: params.record.productId };
      }
      await existedSubscription.save();
    }

    response.success(res, existedSubscription);
  };

  getSubscription = async (req: Request, res: Response) => {
    const existedSubscription = await SubscriptionRepository.getSubscriptionByUserId(req.user.id);

    response.success(res, existedSubscription);
  };

  webHook = async (req: Request, res: Response) => {
    await this.stripeWebHooks(req);

    res.json();
  };

  updateSubscription = async (req: Request<{}, {}, UpdateSubscriptionParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const subscription = await SubscriptionRepository.getSubscriptionByUserId(req.user.id);

    if (!subscription || subscription.subscriptionId !== id) {
      throw new NotFoundError(messages.subscription.notFound);
    }

    await this.updateSubscriptionService(subscription, req.body);

    response.success(res);
  };
}

export default new StripeController();
