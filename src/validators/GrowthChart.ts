import { Joi } from 'express-validation';

export default {
  createGrowthRecord: {
    body: Joi.object({
      babyBookId: Joi.string().required(),
      date: Joi.date().required(),
      headCircumference: Joi.number().required(),
      weight: Joi.number().required(),
      height: Joi.number().required(),
    }),
  },
  updateAgePeriod: {
    body: Joi.object({
      ages: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            text: Joi.string().required(),
            minAgeMonth: Joi.number().required(),
            maxAgeMonth: Joi.number().required(),
          })
        )
        .required(),
    }),
  },
  addPercentile: {
    body: Joi.object({
      versionYear: Joi.number().required(),
      isReleased: Joi.boolean().required(),
      points: Joi.array()
        .items(
          Joi.object({
            sex: Joi.string().valid('male', 'female').required(),
            ageMonth: Joi.number().required(),
            weight: Joi.number().required(),
            height: Joi.number().required(),
            headCircumference: Joi.number().required(),
            level: Joi.string().required(),
            color: Joi.string().allow(null),
          })
        )
        .required(),
    }),
  },
  updateGrowthPoint: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      date: Joi.date().allow(null),
      weight: Joi.number().allow(null),
      height: Joi.number().allow(null),
      headCircumference: Joi.number().allow(null),
    }),
  },
  getListGrowthPoint: {
    query: Joi.object({
      searchBy: Joi.string().valid('weight', 'height', 'head_circumference').allow(null),
      periodId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
      versionYear: Joi.number().allow(null),
      isPercentile: Joi.boolean().allow(null),
      isOutdated: Joi.boolean().allow(null),
      sex: Joi.string().valid('male', 'female').allow(null),
    }),
  },
  getListSharedGrowthPoint: {
    query: Joi.object({
      searchBy: Joi.string().valid('weight', 'height', 'head_circumference').allow(null),
      periodId: Joi.string().allow(null),
      babyBookId: Joi.string().allow(null),
      versionYear: Joi.number().allow(null),
      isPercentile: Joi.boolean().allow(null),
      isOutdated: Joi.boolean().allow(null),
      sex: Joi.string().valid('male', 'female').allow(null),
      sessionId: Joi.string().required(),
      email: Joi.string().required(),
    }),
  },
  deleteGrowthPoint: {
    query: Joi.object({
      ids: Joi.string().required(),
    }),
  },
  deletePercentiles: {
    query: Joi.object({
      level: Joi.string().allow(null),
      month: Joi.number().allow(null),
      versionYear: Joi.number().required(),
    }),
  },
  updatePercentile: {
    body: Joi.object({
      isReleased: Joi.boolean().allow(null),
      versionYear: Joi.number().required(),
    }),
  },
};
