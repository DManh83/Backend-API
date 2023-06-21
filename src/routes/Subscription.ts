import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import StripeController from '../controllers/Subscription';
import authentication from '../middlewares/authentication';
import validators from '../validators/Subscription';

const router = express.Router();

router.post('/webhook', wrapper(StripeController.webHook));

router.get('/prices', [authentication], wrapper(StripeController.getPlanList));

router.put('/:id', [authentication], validate(validators.updateSubscription), wrapper(StripeController.updateSubscription));
router.post('/', [authentication], validate(validators.createSubscription), wrapper(StripeController.createSubscription));
router.post('/apple', [authentication], validate(validators.createAppleSubscription), wrapper(StripeController.createAppleSubscription));
router.get('/', [authentication], wrapper(StripeController.getSubscription));

export default router;
