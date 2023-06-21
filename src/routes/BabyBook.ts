import express from 'express';
import { validate } from 'express-validation';

import { IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_PHOTO } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import BabyBookController from '../controllers/BabyBook';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import fileUploadMiddleware from '../middlewares/file-upload';
import validators from '../validators/BabyBook';

const router = express.Router();

const fileUpload = fileUploadMiddleware.multerUpload({ limitSize: MAX_SIZE_UPLOAD_PHOTO, extensions: IMAGE_EXTENSIONS }).single('photo');

router.post('/share/verify', validate(validators.verifySharingSession), wrapper(BabyBookController.verifySharingSession));
router.put('/share/stop/:id', [authentication], wrapper(BabyBookController.stopSharingSession));
router.post('/share/status/:id', wrapper(BabyBookController.checkSessionStatus));
router.post('/share', [authentication], validate(validators.shareBabyBook), wrapper(BabyBookController.shareBabyBook));
router.post(
  '/share/check-duplicated',
  [authentication],
  validate(validators.checkDuplicatedSharedBooks),
  wrapper(BabyBookController.checkDuplicatedSharedBooks)
);
router.get('/share', [authentication], validate(validators.getListSharedSession), wrapper(BabyBookController.getListSharedSession));
router.delete('/share/:id', [authentication], wrapper(BabyBookController.deleteSharedSession));
router.get('/share/changes', [authentication], validate(validators.getListSharedSession), wrapper(BabyBookController.getSharingChanges));
router.get('/share/items', [verifySession], validate(validators.getSharedBabyBook), wrapper(BabyBookController.getSharedBabyBook));
router.get(
  '/share/user-items',
  [authentication],
  validate(validators.getSharedBookOfUser),
  wrapper(BabyBookController.getSharedBookOfUser)
);

router.get('/count', [adminAuthentication], validate(validators.countBabyBook), wrapper(BabyBookController.countBabyBook));

router.post('/', [authentication], [fileUpload], validate(validators.create), wrapper(BabyBookController.create));
router.get('/', [authentication], validate(validators.list), wrapper(BabyBookController.list));
router.put('/:id', [authentication], [fileUpload], validate(validators.update), wrapper(BabyBookController.update));
router.delete('/:id', [authentication], validate(validators.delete), wrapper(BabyBookController.delete));
router.put('/:id/undo', [authentication], validate(validators.undo), wrapper(BabyBookController.undo));

export default router;
