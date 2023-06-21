import express from 'express';
import { validate } from 'express-validation';

import { IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_PHOTO } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import MilestoneController from '../controllers/Milestone';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import fileUpload from '../middlewares/file-upload';
import validators from '../validators/Milestone';

const router = express.Router();

const fileUploadSingle = fileUpload.multerUpload({ limitSize: MAX_SIZE_UPLOAD_PHOTO, extensions: IMAGE_EXTENSIONS }).single('photo');

// API for milestone groups
router.get('/groups', [authentication], wrapper(MilestoneController.listGroups));

// API for milestone ages
router.get('/ages', [authentication], validate(validators.listAge), wrapper(MilestoneController.listAges));

// API for milestone behavior
router.get('/behaviors/all', [authentication], wrapper(MilestoneController.listAllBehaviors));
router.get('/behaviors', [authentication], validate(validators.listBehavior), wrapper(MilestoneController.listBehaviors));
router.post('/behaviors', [adminAuthentication], validate(validators.createBehavior), wrapper(MilestoneController.createBehavior));
router.put('/behaviors/:id', [adminAuthentication], validate(validators.updateBehavior), wrapper(MilestoneController.updateBehavior));
router.delete('/behaviors', [adminAuthentication], validate(validators.deleteBehaviors), wrapper(MilestoneController.deleteBehaviors));

// API for milestone album
router.post('/albums/validate-name', [authentication], validate(validators.validateName), wrapper(MilestoneController.validateAlbumName));
router.get('/albums/shared', [verifySession], validate(validators.listMilestoneAlbums), wrapper(MilestoneController.listMilestoneAlbum));
router.get('/albums/:id/shared', [verifySession], validate(validators.getSingleAlbum), wrapper(MilestoneController.getSingleAlbum));
router.get('/albums/:id', [authentication], validate(validators.getSingleAlbum), wrapper(MilestoneController.getSingleAlbum));
router.get('/albums', [authentication], validate(validators.listMilestoneAlbums), wrapper(MilestoneController.listMilestoneAlbum));
router.put('/albums/:id', [authentication], validate(validators.updateMilestoneAlbum), wrapper(MilestoneController.updateAlbum));
router.delete('/albums/:id', [authentication], validate(validators.deleteAlbum), wrapper(MilestoneController.deleteAlbum));

// API for milestone photos
router.get('/photos', [authentication], validate(validators.getMilestonePhotos), wrapper(MilestoneController.getMilestonePhotos));
router.get('/photos/shared', [verifySession], validate(validators.getMilestonePhotos), wrapper(MilestoneController.getMilestonePhotos));
router.post(
  '/photo',
  [authentication],
  [fileUpload.fileLimitation, fileUploadSingle],
  validate(validators.uploadMilestonePhoto),
  wrapper(MilestoneController.uploadMilestonePhoto)
);
router.put('/photos/:id/undo', [authentication], validate(validators.undoPhotos), wrapper(MilestoneController.undoMilestonePhotos));
router.put('/photo/:id', [authentication], validate(validators.updateMilestonePhoto), wrapper(MilestoneController.updatePhoto));
router.delete('/photos/:id', [authentication], validate(validators.deletePhotos), wrapper(MilestoneController.deleteMilestonePhotos));

// API for milestone
router.post('/', [authentication], validate(validators.createMilestone), wrapper(MilestoneController.createMilestone));
router.put('/:id', [authentication], validate(validators.updateMilestone), wrapper(MilestoneController.updateMilestone));
router.get('/:id/shared', [verifySession], validate(validators.getMilestone), wrapper(MilestoneController.getMilestoneById));
router.get('/:id', [authentication], validate(validators.getMilestone), wrapper(MilestoneController.getMilestoneById));

export default router;
