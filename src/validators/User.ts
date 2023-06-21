import { Joi } from 'express-validation';

export default {
  getSuggestion: {
    query: Joi.object({
      searchKey: Joi.string().required().allow(null),
    }),
  },
  getUserList: {
    query: Joi.object({
      sortBy: Joi.string().valid('created_at', 'updated_at', 'first_name', 'last_name', 'country_code', 'total_baby_book').allow(null),
      sortDirection: Joi.string().valid('ASC', 'DESC').allow(null),
      page: Joi.number().min(1).allow(null),
      pageSize: Joi.number().max(100).allow(null),
      roles: Joi.string().required(),
      countryCodes: Joi.string().allow(null),
      searchValue: Joi.string().allow('', null),
      subscribers: Joi.boolean().allow(null),
    }),
  },
  countUser: {
    query: Joi.object({
      from: Joi.string().allow(null),
      to: Joi.string().allow(null),
      viewBy: Joi.string().valid('week', 'month', 'year').allow(null),
    }),
  },
  updateStaff: {
    body: Joi.object({
      email: Joi.string().required(),
      role: Joi.string().valid('member', 'editor', 'admin'),
    }),
  },
  updateUserInformation: {
    body: Joi.object({
      lastName: Joi.string().allow('', null),
      firstName: Joi.string().allow('', null),
      birthday: Joi.date().max('now').allow('', null),
      streetAddress: Joi.string().allow('', null),
      sex: Joi.string().valid('male', 'female').allow('', null),
      workPhone: Joi.string().max(20).allow('', null),
      cityTown: Joi.string().allow('', null),
      countryCode: Joi.string().allow('', null),
      stateProvince: Joi.string().allow('', null),
      postalCode: Joi.string().allow('', null),
      avatar: Joi.string().allow('', null),
      checkUpsNotify: Joi.boolean().allow(null),
      customCheckUpsNotify: Joi.boolean().allow(null),
      customImmunizationsNotify: Joi.boolean().allow(null),
      immunizationsNotify: Joi.boolean().allow(null),
      generalInformationNotify: Joi.boolean().allow(null),
      inactivityNotify: Joi.boolean().allow(null),
      seenSharingGuide: Joi.boolean().allow(null),
      pushNotify: Joi.boolean().allow(null),
      receiveMail: Joi.boolean().allow(null),
      subscribeNewsletter: Joi.boolean().allow(null),
    }),
  },

  requestUpdatePhone: {
    body: Joi.object({
      newPhone: Joi.string().max(20).allow('', null),
    }),
  },

  checkRegisteredEmail: {
    body: Joi.object({
      email: Joi.string().required(),
    }),
  },

  updatePhone: {
    body: Joi.object({
      newPhone: Joi.string().max(20).allow('', null),
      otp: Joi.string().length(6).required(),
      expiredTime: Joi.date().required(),
    }),
  },

  updateSessionExpire: {
    body: Joi.object({
      sessionExpire: Joi.number().allow(null),
    }),
  },

  addDeviceToken: {
    body: Joi.object({
      token: Joi.string().required(),
    }),
  },

  deleteDeviceToken: {
    params: Joi.object({
      token: Joi.string().required(),
    }),
  },

  searchGlobal: {
    query: Joi.object({
      sessionId: Joi.string().allow(null),
      email: Joi.string().allow(null),
      value: Joi.string().required(),
    }),
  },

  deleteUser: {
    body: Joi.object({
      password: Joi.string().max(200).required(),
      reason: Joi.string().required(),
      feedback: Joi.string().allow(null, ''),
    }),
  },

  getTemplateEmail: {
    query: Joi.object({
      templateId: Joi.string().allow(null),
    }),
  },

  sendNewsletter: {
    body: Joi.object({
      templateId: Joi.number().required(),
      isSendAll: Joi.boolean().required(),
      emails: Joi.array().items(Joi.string()).min(0),
    }),
  },

  getEmail: {
    query: Joi.object({
      id: Joi.string().required(),
    }),
  },

  unsubscribe: {
    body: Joi.object({
      email: Joi.string().required(),
    }),
  },
};
