import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import validators from '../validators/GrowthChart';
import GrowthChartController from '../controllers/GrowthChart';

const router = express.Router();

router.get('/age-period', wrapper(GrowthChartController.getAgePeriodList));
router.put('/age-period', [adminAuthentication], validate(validators.updateAgePeriod), wrapper(GrowthChartController.updateAgePeriod));

router.post('/percentile', [adminAuthentication], validate(validators.addPercentile), wrapper(GrowthChartController.addPercentile));
router.delete(
  '/percentile',
  [adminAuthentication],
  validate(validators.deletePercentiles),
  wrapper(GrowthChartController.deletePercentiles)
);
router.put('/percentile', [adminAuthentication], validate(validators.updatePercentile), wrapper(GrowthChartController.updatePercentile));
router.get('/percentile/version', [authentication], wrapper(GrowthChartController.getPercentileVersion));
router.post('/', [authentication], validate(validators.createGrowthRecord), wrapper(GrowthChartController.createGrowthRecord));
router.get('/shared', [verifySession], validate(validators.getListSharedGrowthPoint), wrapper(GrowthChartController.getListGrowthPoint));
router.get('/', [authentication], validate(validators.getListGrowthPoint), wrapper(GrowthChartController.getListGrowthPoint));
router.put('/:id', [authentication], validate(validators.updateGrowthPoint), wrapper(GrowthChartController.updateGrowthPoint));
router.delete('/', [authentication], validate(validators.deleteGrowthPoint), wrapper(GrowthChartController.deleteGrowthPoint));

export default router;
