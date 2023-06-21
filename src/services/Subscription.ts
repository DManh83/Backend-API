import { Request } from 'express';
import { get, has } from 'lodash';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

import env from '../../config/env';
import InternalServerError from '../common/errors/types/InternalServerError';
import { camelize } from '../common/helpers/camelize';
import { CreateSubscriptionParams, SubscriptionStatus, UpdateSubscriptionParams } from '../interfaces/Subscription';
import SubscriptionModel from '../models/Subscription';
import UserModel from '../models/User';

const stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2020-08-27' });

class StripeServices {
  createCustomer = async (user: UserModel) => {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        id: user.id,
      },
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return customer;
  };

  updatePaymentMethod = async (user: UserModel, paymentMethodId: string) => {
    if (!user.stripeCustomerId) {
      await this.createCustomer(user);
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return paymentMethod;
  };

  createSubscriptionService = async (user: UserModel, params: CreateSubscriptionParams) =>
    stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [
        {
          price: params.priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { id: user.id, type: params.productType },
    });

  stripeWebHooks = async (req: Request) => {
    if (req.body.notification_type) {
      const payload = camelize(req.body);
      const latestReceipt = payload.unifiedReceipt.latestReceiptInfo[0];
      const encodedReceipt = payload.unifiedReceipt.latestReceipt;

      console.log(`=====================${payload.notificationType}====================`);

      const subscription = await SubscriptionModel.findOne({
        where: { subscriptionId: latestReceipt.originalTransactionId },
      });

      switch (payload.notificationType) {
        case 'DID_CHANGE_RENEWAL_STATUS':
        case 'INTERACTIVE_RENEWAL':
        case 'DID_RENEW': {
          if (!subscription) {
            await SubscriptionModel.create({
              userId: uuidv4(),
              record: payload,
              subscriptionId: latestReceipt.originalTransactionId,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(parseInt(latestReceipt.purchaseDateMs, 10)),
              currentPeriodEnd: new Date(parseInt(latestReceipt.expiresDateMs, 10)),
              cancelAtPeriodEnd: payload.autoRenewStatus === 'false',
            });
          } else {
            subscription.record = { latestReceipt, encodedReceipt };
            subscription.status = SubscriptionStatus.ACTIVE;
            subscription.currentPeriodStart = new Date(parseInt(latestReceipt.purchaseDateMs, 10));
            subscription.currentPeriodEnd = new Date(parseInt(latestReceipt.expiresDateMs, 10));
            subscription.cancelAtPeriodEnd = payload.autoRenewStatus === 'false';
            await subscription.save();
          }
          break;
        }
        case 'CANCEL':
          if (subscription) {
            await subscription.destroy();
          }
          break;

        default:
          break;
      }
    } else {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req['rawBody'], req.headers['stripe-signature'], env.stripeWebhookSecret);
      } catch (err) {
        throw new InternalServerError();
      }

      // Extract the object from the event.
      const dataObject = camelize(event.data.object);

      // Handle the event
      switch (event.type) {
        case 'payment_method.attached':
          await UserModel.update({ paymentMethod: dataObject }, { where: { stripeCustomerId: dataObject.customer } });
          break;

        case 'customer.created':
          await UserModel.update({ stripeCustomerId: dataObject.id }, { where: { id: dataObject.metadata.id } });
          break;

        case 'customer.deleted':
          await UserModel.update({ stripeCustomerId: null }, { where: { stripeCustomerId: dataObject.id } });
          break;

        case 'customer.subscription.created':
          await SubscriptionModel.destroy({ where: { userId: dataObject.metadata.id } });
          await SubscriptionModel.create({
            userId: dataObject.metadata.id,
            record: dataObject,
            subscriptionId: dataObject.id,
            status: dataObject.status,
            currentPeriodStart: new Date(dataObject.currentPeriodStart * 1000),
            currentPeriodEnd: new Date(dataObject.currentPeriodEnd * 1000),
            cancelAtPeriodEnd: dataObject.cancelAtPeriodEnd,
          });
          break;
        case 'customer.subscription.updated':
          await SubscriptionModel.update(
            {
              record: dataObject,
              status: dataObject.status,
              currentPeriodStart: new Date(dataObject.currentPeriodStart * 1000),
              currentPeriodEnd: new Date(dataObject.currentPeriodEnd * 1000),
              cancelAtPeriodEnd: dataObject.cancelAtPeriodEnd,
              updatedAt: new Date(),
            },
            { where: { subscriptionId: dataObject.id } }
          );
          break;
        case 'customer.subscription.deleted':
          await SubscriptionModel.destroy({ where: { subscriptionId: dataObject.id } });
          break;
        default:
      }
    }
  };

  updateSubscriptionService = async (subscription: SubscriptionModel, params: UpdateSubscriptionParams) => {
    if (has(params, 'cancelAtPeriodEnd')) {
      await stripe.subscriptions.update(subscription.subscriptionId, { cancel_at_period_end: get(params, 'cancelAtPeriodEnd') });
    }
  };

  cancelSubscription = async (subscriptionId: string) => {
    try {
      await Promise.all([
        stripe.subscriptions.del(subscriptionId),
        SubscriptionModel.destroy({
          where: {
            subscriptionId,
          },
        }),
      ]);
    } catch (error) {
      console.log(error);
    }
  };
}

export default StripeServices;
