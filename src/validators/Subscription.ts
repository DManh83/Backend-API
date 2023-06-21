import { Joi } from 'express-validation';

export default {
  createSubscription: {
    body: Joi.object({
      priceId: Joi.string().required(),
      paymentMethodId: Joi.string().allow(null),
      productType: Joi.string().valid('Basic', 'Intermediate', 'Advanced'),
    }),
  },
  createAppleSubscription: {
    body: Joi.object({
      subscriptionId: Joi.string().required(),
      record: Joi.object(),
    }),
  },
  updateSubscription: {
    body: Joi.object({
      cancelAtPeriodEnd: Joi.boolean().allow(null),
    }),
  },
};
