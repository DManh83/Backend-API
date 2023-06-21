import { Joi } from 'express-validation';

export default {
  getNotificationList: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
    }),
  },
  updateNotification: {
    body: Joi.object({
      isSeen: Joi.boolean().allow(null),
    }),
  },
};
