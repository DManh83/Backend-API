import { Joi } from 'express-validation';

export default {
  getFeedbackList: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
    }),
  },
  createFeedback: {
    body: Joi.object({
      email: Joi.string().email().max(50).required(),
      reason: Joi.string().required(),
      feedback: Joi.string().allow(null, ''),
    }),
  },
};
