import { Joi } from 'express-validation';

export default {
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().max(200).required(),
      isBiometric: Joi.boolean().allow(null),
    }),
  },
  requestOTP: {
    body: Joi.object({
      email: Joi.string().email().required(),
      type: Joi.string().valid('email', 'sms').required(),
    }),
  },
  verifyOTP: {
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required(),
      expiredTime: Joi.date().required(),
    }),
  },
  signUp: {
    body: Joi.object({
      countryCode: Joi.string().max(3).required(),
      firstName: Joi.string().max(50).required(),
      lastName: Joi.string().max(50).required(),
      phone: Joi.string().max(20).required(),
      email: Joi.string().email().max(50).required(),
      password: Joi.string().min(6).max(200).required(),
      confirmationPassword: Joi.ref('password'),
      subscribeNewsletter: Joi.boolean().allow(null),
    }),
  },
  checkVerification: {
    query: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  updateVerificationDefault: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  setVerificationDefault: {
    body: Joi.object({
      type: Joi.valid('email', 'sms').required(),
      otp: Joi.string().length(6).required(),
      expiredTime: Joi.date().required(),
    }),
  },
  requestResetPassword: {
    body: Joi.object({
      email: Joi.string().email().allow(null, ''),
      phone: Joi.string().max(20).allow(null, ''),
      type: Joi.string().valid('email', 'sms').required(),
    }),
  },
  resetPassword: {
    body: Joi.object({
      password: Joi.string().min(6).max(200).required(),
      confirmationPassword: Joi.ref('password'),
    }),
  },
  requestChangePassword: {
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).max(200).required(),
      confirmPassword: Joi.ref('newPassword'),
    }),
  },
  changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).max(200).required(),
      confirmPassword: Joi.ref('newPassword'),
      otp: Joi.string().length(6).required(),
      expiredTime: Joi.date().required(),
    }),
  },
  requestUpdatePhone: {
    body: Joi.object({
      newPhone: Joi.string().max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().max(200).required(),
    }),
  },
  updatePhone: {
    body: Joi.object({
      newPhone: Joi.string().max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().max(200).required(),
      otp: Joi.string().length(6).required(),
      expiredTime: Joi.date().required(),
    }),
  },
};
