import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import NotificationController from '../controllers/Notification';
import authentication from '../middlewares/authentication';
import validators from '../validators/Notification';

const router = express.Router();

router.put('/all', [authentication], validate(validators.updateNotification), wrapper(NotificationController.updateAllNotification));

router.get('/unread-count', [authentication], wrapper(NotificationController.getUnreadCount));

router.put('/:id', [authentication], validate(validators.updateNotification), wrapper(NotificationController.updateNotification));

router.delete('/:id', [authentication], wrapper(NotificationController.removeNotification));

router.get('/', [authentication], validate(validators.getNotificationList), wrapper(NotificationController.getNotificationList));

export default router;
