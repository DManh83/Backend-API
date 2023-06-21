import express from 'express';
import { validate } from 'express-validation';

import { IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_PHOTO } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import UserController from '../controllers/User';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import fileUpload from '../middlewares/file-upload';
import validators from '../validators/User';

const router = express.Router();

const fileUploadSingle = fileUpload.multerUpload({ limitSize: MAX_SIZE_UPLOAD_PHOTO, extensions: IMAGE_EXTENSIONS }).single('avatar');

router.get('/search', [authentication], validate(validators.searchGlobal), wrapper(UserController.searchGlobal));
router.get('/shared/search', [verifySession], validate(validators.searchGlobal), wrapper(UserController.searchGlobal));

router.post('/device-key', [authentication], validate(validators.addDeviceToken), wrapper(UserController.addDevicesToken));
router.delete('/device-key/:token', [authentication], validate(validators.deleteDeviceToken), wrapper(UserController.deleteDeviceToken));

router.get('/autosuggest', validate(validators.getSuggestion), [authentication], wrapper(UserController.autoSuggestion));
router.get('/me', [authentication], wrapper(UserController.getMe));
router.get('/count', [adminAuthentication], validate(validators.countUser), wrapper(UserController.countUser));

router.post('/check-registered', [authentication], validate(validators.checkRegisteredEmail), wrapper(UserController.checkRegisteredEmail));

router.get('/email', validate(validators.getEmail), wrapper(UserController.getEmail));
router.put('/unsubscribe', validate(validators.unsubscribe), wrapper(UserController.unsubscribe));

router.post('/request-phone-verify', [authentication], validate(validators.requestUpdatePhone), wrapper(UserController.requestChangePhone));
router.put('/phone', [authentication], validate(validators.updatePhone), wrapper(UserController.updatePhone));

router.put('/session', [authentication], validate(validators.updateSessionExpire), wrapper(UserController.updateSessionExpire));

router.put('/staff', [adminAuthentication], validate(validators.updateStaff), wrapper(UserController.updateStaff));

router.get('/template-email', [adminAuthentication], validate(validators.getTemplateEmail), wrapper(UserController.getTemplateEmail));
router.post('/send-newsletter', [adminAuthentication], validate(validators.sendNewsletter), wrapper(UserController.sendNewsletter));

router.delete('/', [authentication], validate(validators.deleteUser), wrapper(UserController.deleteUser));
router.put('/', [authentication], validate(validators.updateUserInformation), [fileUploadSingle], wrapper(UserController.updateInfo));
router.get('/', [adminAuthentication], validate(validators.getUserList), wrapper(UserController.getUserList));

export default router;
