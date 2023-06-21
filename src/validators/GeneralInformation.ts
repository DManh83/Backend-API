import { Joi } from 'express-validation';

export default {
  getGeneralInformation: {
    query: Joi.object({
      babyBookId: Joi.string().required(),
    }),
  },
  getSharedGeneralInformation: {
    query: Joi.object({
      babyBookId: Joi.string().required(),
      sessionId: Joi.string().required(),
      email: Joi.string().required(),
    }),
  },
  updateBirthday: {
    body: Joi.object({
      babyBookId: Joi.string().required(),
      birthday: Joi.date().max('now').required(),
      deleteRelatedRecord: Joi.boolean(),
    }),
  },
  updateGeneralInformation: {
    body: Joi.object({
      fileName: Joi.string(),
      babyBookId: Joi.string().required(),
      lastName: Joi.string().required(),
      givenName: Joi.string().required(),
      address: Joi.string().allow('', null),
      sex: Joi.string().valid('male', 'female').allow('', null),
      birthWeight: Joi.number().allow('', null),
      birthtime: Joi.string().allow('', null),
      language: Joi.string().allow('', null),
      totalSibling: Joi.number().allow('', null),
      mother: Joi.string().allow('', null),
      motherPhone: Joi.string().allow('', null),
      motherWorkPhone: Joi.string().allow('', null),
      motherEmail: Joi.string().allow('', null),
      father: Joi.string().allow('', null),
      fatherPhone: Joi.string().allow('', null),
      fatherWorkPhone: Joi.string().allow('', null),
      fatherEmail: Joi.string().allow('', null),
      insuranceNumber: Joi.string().allow('', null),
      insuranceFirstName: Joi.string().allow('', null),
      insuranceSurname: Joi.string().allow('', null),
      insuranceBirthday: Joi.date().max('now').allow('', null),
      insuranceAddress: Joi.string().allow('', null),
      insurerName: Joi.string().allow('', null),
      idSticker: Joi.string().allow('', null),
      practitioner: Joi.string().allow('', null),
      practitionerPhone: Joi.string().allow('', null),
      hospital: Joi.string().allow('', null),
      hospitalPhone: Joi.string().allow('', null),
      nurse: Joi.string().allow('', null),
      nursePhone: Joi.string().allow('', null),
      dentist: Joi.string().allow('', null),
      dentistPhone: Joi.string().allow('', null),
      pediatrician: Joi.string().allow('', null),
      pediatricianPhone: Joi.string().allow('', null),
      other: Joi.string().allow('', null),
      otherPhone: Joi.string().allow('', null),
    }),
  },
};
