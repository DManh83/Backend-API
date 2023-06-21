import express from 'express';
import { validate } from 'express-validation';

import { IMAGE_EXTENSIONS, MAX_SIZE_UPLOAD_PHOTO } from '../common/constants';
import wrapper from '../common/helpers/wrapper';
import NewsController from '../controllers/News';
import authentication, { staffAuthentication } from '../middlewares/authentication';
import fileUploadMiddleware from '../middlewares/file-upload';
import validators from '../validators/News';

const router = express.Router();

const fileUpload = fileUploadMiddleware.multerUpload({ limitSize: MAX_SIZE_UPLOAD_PHOTO, extensions: IMAGE_EXTENSIONS }).single('photo');

router.get('/total-new-released', [authentication], wrapper(NewsController.getTotalNewReleased));
router.delete('/read-all-news', [authentication], wrapper(NewsController.readAllNewReleased));

router.get('/admin', [staffAuthentication], validate(validators.getNewsList), wrapper(NewsController.getNewsListAdmin));

router.post('/file', [staffAuthentication], [fileUpload], wrapper(NewsController.uploadContentFile));

router.get('/user/category', [authentication], wrapper(NewsController.getUserCategoryList));
router.put('/user/category', [authentication], validate(validators.updateUserCategory), wrapper(NewsController.updateUserCategory));

router.post('/category', [staffAuthentication], validate(validators.createCategory), wrapper(NewsController.createCategory));
router.get('/category', [authentication], wrapper(NewsController.getCategoryList));
router.put('/category/:id', [staffAuthentication], validate(validators.updateCategory), wrapper(NewsController.updateCategory));
router.delete('/category/:id', [staffAuthentication], validate(validators.deleteCategory), wrapper(NewsController.deleteCategory));

router.get('/public', validate(validators.getPublicNews), wrapper(NewsController.getPublicNewsList));
router.get('/public/:id', validate(validators.getNewsById), wrapper(NewsController.getPublicNewsById));

router.get('/', [authentication], validate(validators.getNewsList), wrapper(NewsController.getNewsList));
router.get('/:id', [authentication], validate(validators.getNewsById), wrapper(NewsController.getNewsById));
router.post('/', [staffAuthentication], [fileUpload], validate(validators.createNews), wrapper(NewsController.createNews));
router.put('/:id', [staffAuthentication], [fileUpload], validate(validators.updateNews), wrapper(NewsController.updateNews));
router.delete('/:id', [staffAuthentication], validate(validators.deleteNews), wrapper(NewsController.deleteNews));

export default router;
