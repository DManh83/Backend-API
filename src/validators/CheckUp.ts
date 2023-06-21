import { Joi } from 'express-validation';

export default {
  createCheckUp: {
    body: Joi.object({
      babyBookId: Joi.string().required(),
      checkUpVersionId: Joi.string().required(),
      title: Joi.string().required(),
      dateDue: Joi.date().required(),
      notifyAt: Joi.string().allow(null, ''),
      status: Joi.string().allow(null),
      ageDue: Joi.string().allow(null),
      monthDue: Joi.number().allow(null),
      files: Joi.array().items(Joi.string()),
    }),
  },
  uploadFile: {
    body: Joi.object({
      fileName: Joi.string(),
      translatedText: Joi.string().allow(null, ''),
    }),
  },
  getCheckUpFiles: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isDeleted: Joi.boolean().allow(null),
      checkUpVersionId: Joi.string().allow(null),
      checkUpScheduleId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
    }),
  },
  deleteCheckUpFiles: {
    query: Joi.object({
      ids: Joi.string().required(),
      force: Joi.boolean().allow(null),
    }),
  },
  undoCheckUpFiles: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
    }),
  },
  updateCheckUpSchedule: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      dateDone: Joi.date().allow(null, ''),
      title: Joi.string().allow(null, ''),
      dateDue: Joi.date().allow(null, ''),
      notifyAt: Joi.date().allow(null, ''),
      status: Joi.string().allow(null, ''),
      ageDue: Joi.string().allow(null, ''),
      monthDue: Joi.number().allow(null),
      files: Joi.array().items(Joi.string()).allow(null),
    }),
  },
  changeCheckUpVersion: {
    body: Joi.object({
      currentId: Joi.string().allow(null),
      newId: Joi.string().required(),
      babyBookId: Joi.string().required(),
    }),
  },
  createSuggestedCheckUp: {
    body: Joi.object({
      versionId: Joi.string().required(),
      schedules: Joi.array()
        .items(
          Joi.object({
            monthDue: Joi.number().required(),
            ageDue: Joi.string().required(),
            title: Joi.string().required(),
          })
        )
        .required(),
    }),
  },
  updateSuggestedCheckUp: {
    body: Joi.object({
      title: Joi.string().required(),
    }),
  },
  updateVersion: {
    body: Joi.object({
      isReleased: Joi.boolean().allow(null),
    }),
  },
  addSuggestedVersion: {
    body: Joi.object({
      name: Joi.string().required(),
      year: Joi.number().required(),
      isReleased: Joi.boolean().required(),
      source: Joi.string().required(),
      version: Joi.string().required(),
      schedules: Joi.array()
        .items(
          Joi.object({
            monthDue: Joi.number().required(),
            ageDue: Joi.string().required(),
            title: Joi.string().required(),
          })
        )
        .required(),
    }),
  },
  getCheckUpList: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('is_suggested', 'name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
      isSuggested: Joi.boolean().allow(null),
      isReleased: Joi.boolean().allow(null),
      userId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
    }),
  },
  getListCheckUp: {
    query: Joi.object({
      searchValue: Joi.string().allow(null, ''),
      sortBy: Joi.string().valid('created_at', 'updated_at', 'month_due').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      page: Joi.number().min(1).allow(null),
      pageSize: Joi.number().max(100).allow(null),
      checkUpVersionId: Joi.string().required(),
      babyBookId: Joi.string().allow(null),
      order: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
    }),
  },
  getSelectedVersion: {
    query: Joi.object({
      babyBookId: Joi.string().required(),
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
    }),
  },
  deleteCheckUp: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
