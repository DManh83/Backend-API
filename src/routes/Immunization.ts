import express from 'express';
import { validate } from 'express-validation';

import wrapper from '../common/helpers/wrapper';
import ImmunizationController from '../controllers/Immunization';
import authentication, { adminAuthentication, verifySession } from '../middlewares/authentication';
import validators from '../validators/Immunization';

const router = express.Router();

// API for antigen
router.post('/antigen', [adminAuthentication], validate(validators.createNewAntigen), wrapper(ImmunizationController.createNewAntigen));
router.get('/antigen', [authentication], validate(validators.getListAntigen), wrapper(ImmunizationController.getListAntigen));
router.put('/antigen/:id', [adminAuthentication], validate(validators.createNewAntigen), wrapper(ImmunizationController.updateAntigen));
router.delete('/antigen/:id', [adminAuthentication], wrapper(ImmunizationController.deleteAntigen));

// API for Vaccination
router.get(
  '/vaccination/selected/shared',
  [verifySession],
  validate(validators.getSelectedVaccination),
  wrapper(ImmunizationController.getSelectedVaccination)
);
router.get(
  '/vaccination/selected',
  [authentication],
  validate(validators.getSelectedVaccination),
  wrapper(ImmunizationController.getSelectedVaccination)
);
router.get('/vaccination/all', [authentication], wrapper(ImmunizationController.getAllVaccination));
router.get('/vaccination', [authentication], validate(validators.getVaccinationList), wrapper(ImmunizationController.getVaccinationList));
router.put('/vaccination/:id', [authentication], validate(validators.updateVaccination), wrapper(ImmunizationController.updateVaccination));
router.put(
  '/vaccination',
  [authentication],
  validate(validators.changeVaccinationVersion),
  wrapper(ImmunizationController.changeVaccinationVersion)
);
router.post(
  '/vaccination',
  [adminAuthentication],
  validate(validators.createNewVaccination),
  wrapper(ImmunizationController.createNewVaccination)
);
router.delete(
  '/vaccination/:id',
  [authentication],
  validate(validators.deleteVaccination),
  wrapper(ImmunizationController.deleteVaccination)
);

// API for Immunization Schedule
router.post(
  '/pdf-to-immunization',
  [authentication],
  validate(validators.extractImmunizationFromPDF),
  wrapper(ImmunizationController.extractImmunizationFromPDF)
);

router.put(
  '/record/:id',
  [authentication],
  validate(validators.updateImmunizationSchedule),
  wrapper(ImmunizationController.updateImmunizationScheduleRecord)
);
router.delete(
  '/record/:id',
  [authentication],
  validate(validators.deleteImmunizationSchedule),
  wrapper(ImmunizationController.deleteImmunizationSchedule)
);

// API for Suggested Immunization
router.post(
  '/suggested',
  [adminAuthentication],
  validate(validators.createSuggestedImmunization),
  wrapper(ImmunizationController.createSuggestedImmunization)
);
router.delete('/suggested/:id', [adminAuthentication], wrapper(ImmunizationController.deleteSuggestedImmunization));
router.put(
  '/suggested/:id',
  [adminAuthentication],
  validate(validators.updateSuggestedImmunization),
  wrapper(ImmunizationController.updateSuggestedImmunization)
);

// API for Immunization
router.post('/', [authentication], validate(validators.createImmunization), wrapper(ImmunizationController.createNewImmunization));
router.get('/shared', [verifySession], validate(validators.getListImmunization), wrapper(ImmunizationController.getListImmunization));
router.get('/', [authentication], validate(validators.getListImmunization), wrapper(ImmunizationController.getListImmunization));

export default router;
