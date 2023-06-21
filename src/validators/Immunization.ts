import { Joi } from 'express-validation';

export default {
  createImmunization: {
    body: Joi.object({
      vaccinationId: Joi.string().required(),
      antigen: Joi.array().items(Joi.string()),
      monthOld: Joi.string().allow(null),
      dateDue: Joi.date().required(),
      batchNo: Joi.string().allow(null, ''),
      status: Joi.string().allow(null),
      organization: Joi.string().allow(null, ''),
      dateDone: Joi.date().allow(null),
      repeatShotAt: Joi.string().allow(null, ''),
    }),
  },

  createSuggestedImmunization: {
    body: Joi.object({
      vaccinationId: Joi.string().required(),
      schedules: Joi.array()
        .items(
          Joi.object({
            monthOld: Joi.number().required(),
            antigen: Joi.array().items(Joi.string()),
          })
        )
        .required(),
    }),
  },
  createNewAntigen: {
    body: Joi.object({
      name: Joi.string().required(),
    }),
  },
  getListAntigen: {
    query: Joi.object({
      searchValue: Joi.string().allow(null),
      sortBy: Joi.string().valid('name', 'created_at', 'updated_at').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      limit: Joi.number().max(100).allow(null),
      before: Joi.string().allow(null),
      after: Joi.string().allow(null),
    }),
  },
  updateSuggestedImmunization: {
    body: Joi.object({
      antigen: Joi.array().items(Joi.string()),
    }),
  },
  extractImmunizationFromPDF: {
    body: Joi.object({
      file: Joi.string().required(),
      babyBookId: Joi.string().required(),
      vaccinationId: Joi.string().required(),
    }),
  },
  updateImmunizationSchedule: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      batchNo: Joi.string().allow(null, ''),
      status: Joi.string().allow(null, ''),
      dateDone: Joi.date().allow(null, ''),
      dateDue: Joi.date().allow(null, ''),
      antigen: Joi.array().items(Joi.string()).required(),
      organization: Joi.string().allow(null, ''),
      repeatShotAt: Joi.date().allow(null, ''),
    }),
  },
  updateVaccination: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      isReleased: Joi.boolean().allow(null),
      tooltip: Joi.string().allow(null, ''),
    }),
  },
  deleteVaccination: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  changeVaccinationVersion: {
    body: Joi.object({
      currentId: Joi.string().allow(null),
      newId: Joi.string().required(),
      babyBookId: Joi.string().required(),
    }),
  },
  createNewVaccination: {
    body: Joi.object({
      name: Joi.string().required(),
      country: Joi.string().required(),
      indigenous: Joi.boolean().required(),
      medicalCondition: Joi.boolean().required(),
      year: Joi.number().required(),
      code: Joi.string().required(),
      tooltip: Joi.string().allow(null, ''),
      isReleased: Joi.boolean().required(),
      schedules: Joi.array()
        .items(
          Joi.object({
            monthOld: Joi.number().required(),
            antigen: Joi.array().items(Joi.string()),
          })
        )
        .required(),
    }),
  },
  getVaccinationList: {
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
  getListImmunization: {
    query: Joi.object({
      sortBy: Joi.string().valid('created_at', 'updated_at', 'date_due').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      page: Joi.number().min(1).allow(null),
      pageSize: Joi.number().max(100).allow(null),
      vaccinationId: Joi.string().required(),
      babyBookId: Joi.string().allow(null),
      isGetAll: Joi.string().allow(null),
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
      searchValue: Joi.string().allow(null, ''),
    }),
  },
  getSelectedVaccination: {
    query: Joi.object({
      babyBookId: Joi.string().required(),
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
    }),
  },
  deleteImmunizationSchedule: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
