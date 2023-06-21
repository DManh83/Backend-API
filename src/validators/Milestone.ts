import { Joi } from 'express-validation';

import messages from '../common/messages';

export default {
  listBehavior: {
    query: Joi.object({
      groupId: Joi.string().required(),
      ageId: Joi.string().required(),
    }),
  },
  listAge: {
    query: Joi.object({
      groupId: Joi.string().allow(null),
    }),
  },
  uploadMilestonePhoto: {
    body: Joi.object({
      fileName: Joi.string(),
    }),
  },
  createMilestone: {
    body: Joi.object({
      isStandard: Joi.boolean().required(),
      albumName: Joi.string().max(255).required(),
      photos: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
            caption: Joi.string().allow(''),
            isThumbnail: Joi.boolean(),
          })
        )
        .min(1)
        .messages({
          'array.min': messages.milestone.noFileUpload,
        }),
      behaviorId: Joi.string().allow(null),
      babyBookId: Joi.string().required(),
    }),
  },
  createBehavior: {
    body: Joi.object({
      group: Joi.string().max(255).required(),
      milestones: Joi.array()
        .items(
          Joi.object({
            age: Joi.object({
              day: Joi.number(),
              month: Joi.number(),
              year: Joi.number(),
            }).required(),
            behavior: Joi.string().required(),
          })
        )
        .min(1),
    }),
  },
  updateBehavior: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      behavior: Joi.string().required(),
    }),
  },
  deleteBehaviors: {
    query: Joi.object({
      ids: Joi.string().required(),
    }),
  },
  updateMilestone: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      albumName: Joi.string().max(255).allow(null),
      photos: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
            caption: Joi.string().allow(''),
            isThumbnail: Joi.boolean(),
          })
        )
        .min(1)
        .messages({
          'array.min': messages.milestone.noFileUpload,
        }),
    }),
  },
  getMilestone: {
    params: Joi.object({
      id: Joi.string().required(),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
    }),
  },
  updateMilestoneAlbum: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      albumName: Joi.string().max(255).allow(null),
      thumbnailId: Joi.string().allow(null),
    }),
  },
  listMilestoneAlbums: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      isStandard: Joi.boolean().allow(null),
      babyBookId: Joi.string().required(),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  getSingleAlbum: {
    params: Joi.object({
      id: Joi.string(),
    }),
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      babyBookId: Joi.string().allow(null),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  getMilestonePhotos: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      milestoneId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
      albumId: Joi.string().allow(null),
      isGetAll: Joi.boolean().allow(null),
      email: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
    }),
  },
  deletePhotos: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      force: Joi.boolean().allow(null),
    }),
  },
  deleteAlbum: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      force: Joi.boolean().allow(null),
    }),
  },
  undoPhotos: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  updateMilestonePhoto: {
    body: Joi.object({
      caption: Joi.string().allow(null),
    }),
  },
  validateName: {
    body: Joi.object({
      name: Joi.string().required(),
      babyBookId: Joi.string().required(),
    }),
  },
  undoAlbum: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
