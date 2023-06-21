import express from 'express';
import { validate } from 'express-validation';
import AuthController from '../controllers/Auth';
import wrapper from '../common/helpers/wrapper';
import validators from '../validators/Auth';
import authentication from '../middlewares/authentication';

const router = express.Router();

router.post('/login', validate(validators.login), wrapper(AuthController.login));
router.post('/request-otp', validate(validators.requestOTP), wrapper(AuthController.requestOTP));
router.post('/verify-otp', validate(validators.verifyOTP), wrapper(AuthController.verifyOTP));
router.post('/signup', validate(validators.signUp), wrapper(AuthController.signUp));
router.get('/verification', validate(validators.checkVerification), wrapper(AuthController.checkVerification));
router.put(
  '/verification/:id/set-default',
  [authentication],
  validate(validators.updateVerificationDefault),
  wrapper(AuthController.updateVerificationDefault)
);

router.put(
  '/set-verification-default',
  [authentication],
  validate(validators.setVerificationDefault),
  wrapper(AuthController.setVerificationDefault)
);
router.post('/request-reset-password', validate(validators.requestResetPassword), wrapper(AuthController.requestResetPassword));
router.put('/reset-password', [authentication], validate(validators.resetPassword), wrapper(AuthController.resetPassword));

router.post(
  '/request-change-password',
  [authentication],
  validate(validators.requestChangePassword),
  wrapper(AuthController.requestUpdatePassword)
);
router.put('/change-password', [authentication], validate(validators.changePassword), wrapper(AuthController.updatePassword));

router.post('/request-phone-verify', validate(validators.requestUpdatePhone), wrapper(AuthController.requestChangePhone));
router.put('/phone', validate(validators.updatePhone), wrapper(AuthController.updatePhone));

export default router;
