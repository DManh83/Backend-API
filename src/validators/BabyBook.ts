import { Joi } from 'express-validation';

import messages from '../common/messages';

export default {
  shareBabyBook: {
    body: Joi.object({
      email: Joi.string().required(),
      duration: Joi.number().required(),
      babyBookIds: Joi.array().items(Joi.string().required()).min(1).messages({
        'array.min': messages.babyBook.noBabySelected,
      }),
      role: Joi.string().valid('editor', 'viewer').required(),
    }),
  },
  checkDuplicatedSharedBooks: {
    body: Joi.object({
      email: Joi.string().required(),
      babyBookIds: Joi.array().items(Joi.string().required()).min(1).messages({
        'array.min': messages.babyBook.noBabySelected,
      }),
    }),
  },
  verifySharingSession: {
    body: Joi.object({
      email: Joi.string().required(),
      sessionId: Joi.string().required(),
    }),
  },
  getListSharedSession: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('id', 'name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
    }),
  },
  create: {
    body: Joi.object({
      name: Joi.string().max(50).required(),
      fileName: Joi.string(),
      birthday: Joi.date().max('now').required(),
      indigenous: Joi.boolean().allow(null),
      medicalCondition: Joi.boolean().allow(null),
    }),
  },
  list: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('id', 'name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      isGetAll: Joi.boolean().allow(null),
    }),
  },
  getSharedBabyBook: {
    query: Joi.object({
      sessionId: Joi.string().required(),
      email: Joi.string().required(),
    }),
  },
  getSharedBookOfUser: {
    query: Joi.object({
      searchValue: Joi.string().allow('', null),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().max(50).allow(null),
      fileName: Joi.string().allow(null),
      birthday: Joi.date().max('now').allow(null),
      isRemovePhoto: Joi.boolean().allow(null),
      indigenous: Joi.boolean().required(),
      medicalCondition: Joi.boolean().required(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      force: Joi.boolean().allow(null),
    }),
  },
  undo: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  countBabyBook: {
    query: Joi.object({
      from: Joi.string().allow(null),
      to: Joi.string().allow(null),
      viewBy: Joi.string().valid('week', 'month', 'year').allow(null),
    }),
  },
};
