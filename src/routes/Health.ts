import express from 'express';
import { validate } from 'express-validation';

import { DOCUMENT_EXTENSIONS, MAX_SIZE_UPLOAD_FILE, IMAGE_EXTENSIONS } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import HealthController from '../controllers/Health';
import authentication, { verifySession } from '../middlewares/authentication';
import fileUpload from '../middlewares/file-upload';
import validators from '../validators/Health';

const router = express.Router();

const fileUploadSingle = fileUpload
  .multerUpload({ limitSize: MAX_SIZE_UPLOAD_FILE, extensions: [...DOCUMENT_EXTENSIONS, ...IMAGE_EXTENSIONS] })
  .single('file');

// API for health document
router.post(
  '/document',
  [authentication],
  [fileUpload.fileLimitation, fileUploadSingle],
  validate(validators.uploadHealthDocument),
  wrapper(HealthController.uploadHealthDocument)
);
router.get('/document/shared', [verifySession], validate(validators.getListDocument), wrapper(HealthController.getListHealthDocument));
router.get('/document', [authentication], validate(validators.getListDocument), wrapper(HealthController.getListHealthDocument));
router.put('/document/:id', [authentication], validate(validators.updateHealthDocument), wrapper(HealthController.updateHealthDocument));
router.delete('/document/:id', [authentication], validate(validators.deleteHealthDocument), wrapper(HealthController.deleteHealthDocument));
router.put('/document/:id/undo', [authentication], validate(validators.undoHealthDocument), wrapper(HealthController.undoHealthDocument));

// API for folder
router.post('/folder', [authentication], validate(validators.createHealthFolder), wrapper(HealthController.createHealthFolder));
router.get('/folder/shared', [verifySession], validate(validators.getListFolder), wrapper(HealthController.getListHealthFolder));
router.get('/folder', [authentication], validate(validators.getListFolder), wrapper(HealthController.getListHealthFolder));
router.get(
  '/folder/:id/shared',
  [verifySession],
  validate(validators.getSingleHealthFolder),
  wrapper(HealthController.getSingleHealthFolder)
);
router.get('/folder/:id', [authentication], validate(validators.getSingleHealthFolder), wrapper(HealthController.getSingleHealthFolder));
router.put('/folder/:id', [authentication], validate(validators.updateHealthFolder), wrapper(HealthController.updateHealthFolder));
router.delete('/folder/:id', [authentication], validate(validators.deleteHealthFolder), wrapper(HealthController.deleteHealthFolder));

// API for mobile download ZIP folder
router.get(
  '/folder/:id/download',
  [authentication],
  validate(validators.downloadHealthFolder),
  wrapper(HealthController.downloadHealthFolder)
);

export default router;
