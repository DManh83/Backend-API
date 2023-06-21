import express from 'express';
import { validate } from 'express-validation';

import { DOCUMENT_EXTENSIONS, IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_FILE } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import CheckUpController from '../controllers/CheckUp';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import fileUpload from '../middlewares/file-upload';
import validators from '../validators/CheckUp';

const router = express.Router();

// API for upload file
const fileUploadSingle = fileUpload
  .multerUpload({ limitSize: MAX_SIZE_UPLOAD_FILE, extensions: [...DOCUMENT_EXTENSIONS, ...IMAGE_EXTENSIONS] })
  .single('file');

// API for Check-ups Version
router.get(
  '/version/selected/shared',
  [verifySession],
  validate(validators.getSelectedVersion),
  wrapper(CheckUpController.getSelectedVersion)
);
router.get('/version/selected', [authentication], validate(validators.getSelectedVersion), wrapper(CheckUpController.getSelectedVersion));
router.get('/version/all', [adminAuthentication], wrapper(CheckUpController.getAllVersion));
router.get('/version', [authentication], validate(validators.getCheckUpList), wrapper(CheckUpController.getVersionList));
router.put('/version/:id', [authentication], validate(validators.updateVersion), wrapper(CheckUpController.updateVersion));
router.put('/version', [authentication], validate(validators.changeCheckUpVersion), wrapper(CheckUpController.changeCheckUpVersion));
router.post(
  '/version/suggested',
  [adminAuthentication],
  validate(validators.addSuggestedVersion),
  wrapper(CheckUpController.addSuggestedVersion)
);
router.delete('/version/:id', [authentication], wrapper(CheckUpController.deleteVersion));

// API for Check-ups records
router.put(
  '/record/:id',
  [authentication],
  validate(validators.updateCheckUpSchedule),
  wrapper(CheckUpController.updateCheckUpScheduleRecord)
);

// API for Check-ups Files
router.post(
  '/file',
  [authentication],
  [fileUpload.fileLimitation, fileUploadSingle],
  validate(validators.uploadFile),
  wrapper(CheckUpController.uploadCheckUpFile)
);
router.get('/file/shared', [verifySession], validate(validators.getCheckUpFiles), wrapper(CheckUpController.getCheckUpFiles));
router.get('/file', [authentication], validate(validators.getCheckUpFiles), wrapper(CheckUpController.getCheckUpFiles));
router.delete('/file', [authentication], validate(validators.deleteCheckUpFiles), wrapper(CheckUpController.deleteCheckUpFiles));
router.put('/file/undo', [authentication], validate(validators.undoCheckUpFiles), wrapper(CheckUpController.undoCheckUpFiles));

// API for Suggested Check-ups
router.post(
  '/suggested',
  [adminAuthentication],
  validate(validators.createSuggestedCheckUp),
  wrapper(CheckUpController.createSuggestedCheckUp)
);
router.put(
  '/suggested/:id',
  [adminAuthentication],
  validate(validators.updateSuggestedCheckUp),
  wrapper(CheckUpController.updateSuggestedCheckUp)
);
router.delete('/suggested/:id', [authentication], wrapper(CheckUpController.deleteSuggestedCheckUp));

// API for Check-ups
router.post('/', [authentication], validate(validators.createCheckUp), wrapper(CheckUpController.createNewCheckUp));
router.get('/shared', [verifySession], validate(validators.getListCheckUp), wrapper(CheckUpController.getListCheckUp));
router.get('/', [authentication], validate(validators.getListCheckUp), wrapper(CheckUpController.getListCheckUp));
router.delete('/:id', [authentication], validate(validators.deleteCheckUp), wrapper(CheckUpController.deleteCheckUp));

export default router;
