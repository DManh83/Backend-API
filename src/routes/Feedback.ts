import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import FeedbackController from '../controllers/Feedback';
import authentication, { staffAuthentication } from '../middlewares/authentication';
import validators from '../validators/Feedback';

const router = express.Router();

router.post('/', [authentication], validate(validators.createFeedback), wrapper(FeedbackController.createFeedback));
router.get('/', [staffAuthentication], validate(validators.getFeedbackList), wrapper(FeedbackController.getFeedbackList));

export default router;
