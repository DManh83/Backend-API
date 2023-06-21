import { Joi } from 'express-validation';

export default {
  createNews: {
    body: Joi.object({
      title: Joi.string().required(),
      author: Joi.string().required(),
      fileName: Joi.string(),
      content: Joi.string().required(),
      isPublic: Joi.boolean().required(),
      isPublished: Joi.boolean().allow(null),
      categoryIds: Joi.string().allow(null),
    }),
  },
  getNewsList: {
    query: Joi.object({
      userId: Joi.string().allow(null),
      isPublished: Joi.boolean().allow(null),
      showAll: Joi.boolean().allow(null),
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
    }),
  },
  getNewsById: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  updateNews: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      isPublic: Joi.boolean().required(),
      title: Joi.string().allow(null),
      author: Joi.string().allow(null),
      fileName: Joi.string(),
      content: Joi.string().allow(null),
      isPublished: Joi.boolean().allow(null),
      categoryIds: Joi.string().allow(null),
    }),
  },
  deleteNews: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  createCategory: {
    body: Joi.object({
      name: Joi.string().required(),
    }),
  },
  updateCategory: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
    }),
  },
  deleteCategory: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  updateUserCategory: {
    body: Joi.object({
      categoryIds: Joi.array().required(),
    }),
  },
  getPublicNews: {
    query: Joi.object({
      page: Joi.number().allow(null),
      pageSize: Joi.number().max(100).allow(null),
      categoryIds: Joi.string().allow(null, ''),
      searchValue: Joi.string().allow(null, ''),
      except: Joi.string().allow(null, ''),
    }),
  },
};
