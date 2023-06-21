import { Joi } from 'express-validation';

import messages from '../common/messages';

export default {
  uploadHealthDocument: {
    body: Joi.object({
      fileName: Joi.string(),
      translatedText: Joi.string().allow(null, ''),
    }),
  },
  createHealthFolder: {
    body: Joi.object({
      babyBookId: Joi.string().required(),
      name: Joi.string().required(),
      files: Joi.array().items(Joi.string()),
    }),
  },
  updateHealthFolder: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().max(255).allow(null),
      files: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .messages({
          'array.min': messages.health.noFileUpload,
          'array.includesRequiredUnknowns': messages.health.noFileUpload,
        })
        .allow(null),
    }),
  },
  updateHealthDocument: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      filename: Joi.string().required(),
    }),
  },
  getSingleHealthFolder: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      babyBookId: Joi.string().required(),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  getListFolder: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      babyBookId: Joi.string().required(),
      isGetAll: Joi.boolean().allow(null),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  getListDocument: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('filename', 'created_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      babyBookId: Joi.string().allow(null),
      folderId: Joi.string().allow(null),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  deleteHealthDocument: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      force: Joi.boolean().allow(null),
    }),
  },
  deleteHealthFolder: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      force: Joi.boolean().allow(null),
    }),
  },
  undoHealthDocument: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  downloadHealthFolder: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
