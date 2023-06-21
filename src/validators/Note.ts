import { Joi } from 'express-validation';

export default {
  createNote: {
    body: Joi.object({
      title: Joi.string().allow('', null),
      isPinned: Joi.boolean().allow('', null),
      content: Joi.string().required(),
      babyBookId: Joi.string().required(),
      tagIds: Joi.array().items(Joi.string()).allow(null),
    }),
  },
  getNoteList: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'is_pinned').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      babyBookId: Joi.string().required(),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  updateNote: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      isPinned: Joi.boolean().allow(null),
      title: Joi.string().allow('', null),
      content: Joi.string().allow(null),
      tagIds: Joi.array().items(Joi.string()).allow(null),
    }),
  },
  updateMultipleNote: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
      isPinned: Joi.boolean().allow(null),
      title: Joi.string().allow('', null),
      content: Joi.string().allow(null),
      tagIds: Joi.array().items(Joi.string()).allow(null),
      isAddingTag: Joi.boolean().allow(null),
    }),
  },
  updateTag: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
    }),
  },
  createTag: {
    body: Joi.object({
      name: Joi.string().required(),
      babyBookId: Joi.string().allow(null),
    }),
  },
  getTagList: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      userId: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
    }),
  },
  deleteTag: {
    query: Joi.object({
      ids: Joi.string().required(),
      force: Joi.boolean().allow(null),
      babyBookId: Joi.string().allow(null),
    }),
  },
  deleteNote: {
    query: Joi.object({
      ids: Joi.string().required(),
      force: Joi.boolean().allow(null),
    }),
  },
  undoNote: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
    }),
  },
};
