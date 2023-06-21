import express from 'express';
import { validate } from 'express-validation';

import { IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_PHOTO } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import GeneralInformationController from '../controllers/GeneralInformation';
import authentication, { verifySession } from '../middlewares/authentication';
import fileUpload from '../middlewares/file-upload';
import validators from '../validators/GeneralInformation';

const router = express.Router();

const fileUploadSingle = fileUpload.multerUpload({ limitSize: MAX_SIZE_UPLOAD_PHOTO, extensions: IMAGE_EXTENSIONS }).single('idSticker');

// API for general information
router.get(
  '/shared',
  [verifySession],
  validate(validators.getSharedGeneralInformation),
  wrapper(GeneralInformationController.getGeneralInformation)
);
router.get('/', [authentication], validate(validators.getGeneralInformation), wrapper(GeneralInformationController.getGeneralInformation));
router.put('/birthday', [authentication], validate(validators.updateBirthday), wrapper(GeneralInformationController.updateBirthday));
router.put(
  '/',
  [authentication],
  [fileUploadSingle],
  validate(validators.updateGeneralInformation),
  wrapper(GeneralInformationController.updateGeneralInformation)
);

export default router;
