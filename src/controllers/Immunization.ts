import { Request, Response } from 'express';
import { has } from 'lodash';
import { SharingChangeEvent, UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';

import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { extractImmunizationFromPDF, filterImmunizationRecords, paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import {
  ChangeVaccinationVersionParams,
  CreateImmunizationParams,
  CreateNewAntigenParams,
  CreateNewVaccinationParams,
  CreateSuggestedImmunizationParams,
  ExtractImmunizationFromPDF,
  GetListImmunizationParams,
  GetSelectedVaccinationParams,
  GetVaccinationListParams,
  ImmunizationScheduleAttributes,
  UpdateImmunizationScheduleParams,
  UpdateSuggestedImmunizationParams,
  UpdateVaccinationParams,
} from '../interfaces/Immunization';
import BabyBookModel from '../models/BabyBook';
import SharingChangeModel from '../models/SharingChange';
import ImmunizationRepository from '../repositories/Immunization';
import {
  antigenSerializer,
  immunizationSerializer,
  userVaccinationSerializer,
  vaccinationSerializer,
} from '../serializers/immunizationSerializer';
import ImmunizationServices from '../services/Immunization';

class ImmunizationController extends ImmunizationServices {
  public createNewImmunization = async (req: Request<{}, {}, CreateImmunizationParams>, res: Response) => {
    const { body: params, user } = req;

    const existedVaccination = await ImmunizationRepository.getVaccinationById(params.vaccinationId);

    if (!existedVaccination) {
      throw new NotFoundError(messages.vaccination.notFound);
    }

    await withTransaction(async (trans) => {
      const immunization = await this.createImmunization(
        {
          userId: user.id,
          vaccinationId: existedVaccination.id,
          isSuggested: existedVaccination.isSuggested,
        },
        trans
      );

      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedVaccination.babyBookId || null,
          event: SharingChangeEvent.CREATE_SCHEDULE_IMMUNIZATION,
          to: {
            dateDue: params.dateDue,
            isSuggested: immunization.isSuggested,
          },
        });
      }

      const [antigenIds] = await Promise.all([
        this.createAntigens(params.antigen, user.id, trans),
        this.createScheduledImmunization(
          {
            userId: user.id,
            babyBookId: existedVaccination.babyBookId,
            vaccinationId: existedVaccination.id,
            immunizationId: immunization.id,
            dateDue: params.dateDue,
            batchNo: params.batchNo || null,
            status: params.status || null,
            organization: params.organization || null,
            isSuggested: existedVaccination.isSuggested,
            repeatShotAt: params.repeatShotAt || null,
          },
          trans
        ),
      ]);

      await this.updateImmunizationAntigen(antigenIds, immunization.id, trans);
    });

    response.success(res);
  };

  getVaccinationList = async (req: Request<{}, {}, {}, GetVaccinationListParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isSuggested', 'isReleased']);
    const vaccinations = await ImmunizationRepository.findVaccinationWithPagination({
      userId: req.query.userId || req.user.id,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(vaccinations, vaccinationSerializer));
  };

  getAllVaccination = async (req: Request, res: Response) => {
    const vaccinations = await ImmunizationRepository.getAllVaccinationWithImmunization();
    response.success(res, vaccinations.map(vaccinationSerializer));
  };

  getListImmunization = async (req: Request<{}, {}, {}, GetListImmunizationParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['page', 'pageSize']) as GetListImmunizationParams;
    const { session, user } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    let immunizations;
    if (listParams.isGetAll && listParams.vaccinationId) {
      immunizations = await ImmunizationRepository.getAllImmunizationByVaccination(user?.id || session?.userId, listParams);
    } else {
      immunizations = await ImmunizationRepository.findImmunizationWithPagination(user?.id || session?.userId, listParams);
    }

    const newImmunization = immunizations.rows.filter((immunization) => immunization.schedule.length === 0);

    if (newImmunization.length > 0) {
      await Promise.all(
        newImmunization.map(async (immunization) => {
          await withTransaction(async (trans) =>
            this.createScheduleWhenSuggestedImmunizationUpdated(
              listParams.vaccinationId,
              listParams.babyBookId,
              immunization.id,
              user.id,
              trans
            )
          );
        })
      );
      if (listParams.isGetAll && listParams.vaccinationId) {
        immunizations = await ImmunizationRepository.getAllImmunizationByVaccination(user?.id || session?.userId, listParams);
      } else {
        immunizations = await ImmunizationRepository.findImmunizationWithPagination(user?.id || session?.userId, listParams);
      }
    }

    response.success(res, {
      page: listParams.page,
      list: immunizations.rows.map(immunizationSerializer),
      totalImmunizations: immunizations.count,
    });
  };

  getSelectedVaccination = async (req: Request<{}, {}, {}, GetSelectedVaccinationParams>, res: Response) => {
    const { user, session, query: params } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === params.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
    if (!existedBabyBook) throw new NotFoundError(messages.babyBook.notFound);

    const userVaccinations = await ImmunizationRepository.findSelectedVaccination(user?.id || session?.userId, params.babyBookId);

    const vaccinations = userVaccinations.map(userVaccinationSerializer);

    if (user) {
      await withTransaction(async (trans) => {
        if (!vaccinations.find((v) => v.vaccination.isSuggested)) {
          const defaultVaccination = await ImmunizationRepository.findVaccinationByCountryCode(user.countryCode);

          if (defaultVaccination.length === 1 && defaultVaccination[0]) {
            const newUserVaccination = await this.createUserVaccinationRelation(
              user.id,
              params.babyBookId,
              defaultVaccination[0].id,
              trans
            );

            await this.createImmunizationScheduleInVaccination(defaultVaccination[0], existedBabyBook, user.id, trans);
            vaccinations.push({
              id: newUserVaccination.id,
              vaccinationId: defaultVaccination[0].id,
              vaccination: defaultVaccination[0],
            });
          }
        }

        if (!vaccinations.find((v) => !v.vaccination.isSuggested)) {
          const customVaccination = await this.createVaccination(
            {
              userId: user.id,
              name: 'Other vaccinations',
              isSuggested: false,
              babyBookId: params.babyBookId,
            },
            trans
          );

          const customUserVaccination = await this.createUserVaccinationRelation(user.id, params.babyBookId, customVaccination.id, trans);

          vaccinations.push({
            id: customUserVaccination.id,
            vaccinationId: customVaccination.id,
            vaccination: customVaccination,
          });
        }
      });
    }

    response.success(res, vaccinations);
  };

  updateImmunizationScheduleRecord = async (req: Request<{}, {}, UpdateImmunizationScheduleParams>, res: Response) => {
    const {
      body: { antigen, ...scheduleParams },
      user,
    } = req;
    const { id } = req.params as { id: string };

    const existedSchedule = await ImmunizationRepository.getScheduleById(id);

    if (!existedSchedule) throw new NotFoundError(messages.immunizationSchedule.notFound);

    await withTransaction(async (trans) => {
      if (!existedSchedule.isSuggested) {
        const existedImmunization = await ImmunizationRepository.getImmunizationById(existedSchedule.immunizationId);
        const antigenIds = await this.createAntigens(antigen, user.id, trans);

        await this.updateImmunizationAntigen(antigenIds, existedImmunization.id, trans);
      }
      await this.updateImmunizationSchedule(existedSchedule, scheduleParams, user, trans);
    });

    response.success(res);
  };

  extractImmunizationFromPDF = async (req: Request<{}, {}, ExtractImmunizationFromPDF>, res: Response) => {
    const {
      body: { file, ...listParams },
      user,
    } = req;

    const extractedImmunizations = await extractImmunizationFromPDF(file);

    if (!extractedImmunizations.length) {
      throw new BadRequestError(messages.immunization.extractPdfFailed);
    }

    let immunizations = await ImmunizationRepository.getAllImmunizationByVaccination(req.user.id, listParams);
    immunizations = immunizations.map(immunizationSerializer);

    const filterImmunizations = filterImmunizationRecords(extractedImmunizations, immunizations);
    const schedules = filterImmunizations.map((immunization) => {
      const schedule: Partial<ImmunizationScheduleAttributes> = {
        id: immunization.id as string,
        dateDone: immunization.dateGiven,
      };
      if (immunization.dateGiven) {
        schedule.dateDone = immunization.dateGiven;
      }
      if (immunization.batchNo) {
        schedule.batchNo = immunization.batchNo;
      }
      if (immunization.organization) {
        schedule.organization = immunization.organization;
      }
      return schedule;
    });

    const ids = schedules.map((schedule: Partial<ImmunizationScheduleAttributes>) => schedule.id);
    const existedSchedules = await ImmunizationRepository.getScheduleByIds(ids);
    if (ids.length !== existedSchedules.length) throw new NotFoundError(messages.immunizationSchedule.notFound);

    await withTransaction(async (trans) => {
      await Promise.all(
        schedules.map(async (schedule: Partial<ImmunizationScheduleAttributes>) => {
          const { id, ...scheduleParams } = schedule;
          const existedSchedule = existedSchedules.find((schedule) => schedule.id === id);
          await this.updateImmunizationSchedule(existedSchedule, scheduleParams, user, trans);
        })
      );
    });

    response.success(res);
  };

  updateVaccination = async (req: Request<{}, {}, UpdateVaccinationParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const existedVaccination = await ImmunizationRepository.getVaccinationById(id);
    if (!existedVaccination) {
      throw new NotFoundError(messages.vaccination.notFound);
    }
    if ((has(req.body, 'isReleased') || has(req.body, 'tooltip')) && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updateVaccinationService(existedVaccination, req.body, trans);
    });

    response.success(res, vaccinationSerializer(existedVaccination));
  };

  deleteVaccination = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const existedVaccination = await ImmunizationRepository.getVaccinationById(id);
    if (
      !existedVaccination ||
      (!existedVaccination.isSuggested && existedVaccination.userId !== req.user.id) ||
      (existedVaccination.isSuggested && req.user.role !== UserRole.ADMIN)
    )
      throw new NotFoundError(messages.vaccination.notFound);

    await withTransaction(async (trans) => {
      await existedVaccination.update({ isDeleted: true }, { transaction: trans });
    });

    response.success(res);
  };

  deleteImmunizationSchedule = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;

    const existedSchedule = await ImmunizationRepository.getScheduleById(id);
    if (!existedSchedule) throw new NotFoundError(messages.immunizationSchedule.notFound);

    await withTransaction(async (trans) => {
      if (existedSchedule.isSuggested) {
        await this.resetImmunizationSchedule(existedSchedule, trans);
      } else {
        await this.destroyImmunization(existedSchedule.immunizationId, trans);
      }
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedSchedule.babyBookId,
          event: SharingChangeEvent.DELETE_SCHEDULE_IMMUNIZATION,
          to: {
            ageDue: existedSchedule.dateDue,
            isSuggested: existedSchedule.isSuggested,
          },
        });
      }
    });

    response.success(res);
  };

  changeVaccinationVersion = async (req: Request<{}, {}, ChangeVaccinationVersionParams>, res: Response) => {
    const { user, body: params } = req;

    const [userVaccinations, currentVaccination, newVaccination] = await Promise.all([
      ImmunizationRepository.findSelectedVaccination(user.id, params.babyBookId),
      params.currentId ? ImmunizationRepository.getVaccinationById(params.currentId) : null,
      ImmunizationRepository.getVaccinationById(params.newId),
    ]);

    if (
      currentVaccination &&
      (params.currentId === params.newId ||
        !newVaccination ||
        !currentVaccination.isSuggested ||
        !newVaccination.isSuggested ||
        !userVaccinations.find((uv) => uv.vaccinationId === currentVaccination.id) ||
        !newVaccination.isReleased)
    ) {
      throw new NotFoundError(messages.vaccination.notFound);
    }

    if (!currentVaccination && (!newVaccination || !newVaccination.isSuggested || !newVaccination.isReleased)) {
      throw new NotFoundError(messages.vaccination.notFound);
    }
    const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
    if (!existedBabyBook) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    await withTransaction(async (trans) => {
      const actions: Promise<any>[] = [
        this.createImmunizationScheduleInVaccination(newVaccination, existedBabyBook, user.id, trans),
        this.createUserVaccinationRelation(user.id, params.babyBookId, newVaccination.id, trans),
      ];

      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedBabyBook.id,
          event: SharingChangeEvent.CHANGE_VACCINATION,
          from: {
            version: `${currentVaccination.name || ''} ${currentVaccination.code || ''} ${`${
              currentVaccination.name && currentVaccination.country ? '-' : ''
            }  ${currentVaccination.country || ''}`} ${currentVaccination.year || ''}`.trim(),
          },
          to: {
            version: `${newVaccination.name || ''} ${newVaccination.code || ''} ${`${
              newVaccination.name && newVaccination.country ? '-' : ''
            }  ${newVaccination.country || ''}`} ${newVaccination.year || ''}`.trim(),
          },
        });
      }

      if (currentVaccination) {
        actions.push(
          ...[
            this.destroyScheduleOfVaccination(currentVaccination.id, user.id, params.babyBookId, trans),
            this.destroyUserVaccinationRelation(user.id, currentVaccination.id, params.babyBookId, trans),
          ]
        );
      }

      await Promise.all(actions);
    });

    response.success(res);
  };

  createNewVaccination = async (req: Request<{}, {}, CreateNewVaccinationParams>, res: Response) => {
    const { body: params } = req;

    const existedVaccination = await ImmunizationRepository.findVaccinationByVersion(params);
    if (existedVaccination && !existedVaccination.isDeleted) {
      throw new BadRequestError(messages.vaccination.alreadyExists);
    }

    await withTransaction(async (trans) => {
      const vaccination = await this.createVaccination(
        {
          name: params.name,
          country: params.country,
          isSuggested: true,
          code: params.code,
          year: params.year,
          tooltip: params?.tooltip,
          indigenous: params?.indigenous,
          medicalCondition: params?.medicalCondition,
          isReleased: params.isReleased,
        },
        trans
      );

      await Promise.all(
        params.schedules.map(async (schedule) => {
          const antigenIds = await this.createAntigens(schedule.antigen, null, trans);
          await this.createImmunizationSuggested(
            {
              vaccinationId: vaccination.id,
              isSuggested: true,
              monthOld: schedule.monthOld,
            },
            antigenIds,
            trans
          );
        })
      );
    });

    response.success(res);
  };

  createSuggestedImmunization = async (req: Request<{}, {}, CreateSuggestedImmunizationParams>, res: Response) => {
    const { body: params } = req;

    const existedVaccination = await ImmunizationRepository.getVaccinationById(params.vaccinationId);
    if (!existedVaccination || !existedVaccination.isSuggested) {
      throw new BadRequestError(messages.vaccination.notFound);
    }

    await withTransaction(async (trans) => {
      await Promise.all(
        params.schedules.map(async (schedule) => {
          const existedImmunization = await ImmunizationRepository.findImmunizationByVaccination(existedVaccination.id, schedule.monthOld);
          const antigenIds = await this.createAntigens(schedule.antigen, null, trans);

          const newAntigenId = antigenIds.filter(
            (antigenId) => !existedImmunization.some((immunization) => immunization.antigenId === antigenId)
          );

          await this.createImmunizationSuggested(
            {
              vaccinationId: existedVaccination.id,
              isSuggested: true,
              monthOld: schedule.monthOld,
            },
            newAntigenId,
            trans
          );
        })
      );
    });

    response.success(res);
  };

  deleteSuggestedImmunization = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const firstExistedImmunization = await ImmunizationRepository.getImmunizationById(id);

    const allExistedImmunization = await ImmunizationRepository.findImmunizationByVaccination(
      firstExistedImmunization.vaccinationId,
      firstExistedImmunization.monthOld
    );

    if (!firstExistedImmunization || !firstExistedImmunization.isSuggested || !allExistedImmunization.length) {
      throw new NotFoundError(messages.immunization.notFound);
    }

    const immunizationIds = allExistedImmunization.map((immunization) => immunization.id);

    await withTransaction(async (trans) => {
      await this.destroyImmunizationSuggested(immunizationIds, trans);
    });
    response.success(res);
  };

  updateSuggestedImmunization = async (req: Request<{}, {}, UpdateSuggestedImmunizationParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const params = req.body;

    const firstExistedImmunization = await ImmunizationRepository.getImmunizationById(id);

    const allExistedImmunizations = await ImmunizationRepository.findImmunizationByVaccination(
      firstExistedImmunization.vaccinationId,
      firstExistedImmunization.monthOld
    );

    if (!firstExistedImmunization || !firstExistedImmunization.isSuggested || !allExistedImmunizations.length) {
      throw new NotFoundError(messages.immunization.notFound);
    }

    await withTransaction(async (trans) => {
      const antigenIds = await this.createAntigens(params.antigen, null, trans);

      const newAntigenId = antigenIds.filter(
        (antigenId) => !allExistedImmunizations.some((immunization) => immunization.antigenId === antigenId)
      );

      const removeImmunizationsId = allExistedImmunizations
        .filter((immunization) => !antigenIds.some((antigenId) => immunization.antigenId === antigenId))
        .map((immunization) => immunization.id);

      await this.destroyImmunizationSuggested(removeImmunizationsId, trans);

      await this.createImmunizationSuggested(
        {
          vaccinationId: firstExistedImmunization.vaccinationId,
          isSuggested: true,
          monthOld: firstExistedImmunization.monthOld,
        },
        newAntigenId,
        trans
      );
    });
    response.success(res);
  };

  createNewAntigen = async (req: Request<{}, {}, CreateNewAntigenParams>, res: Response) => {
    const { body: params } = req;

    const existedAntigen = await ImmunizationRepository.findAntigenByName(params.name);

    if (existedAntigen) {
      throw new NotFoundError(messages.antigen.alreadyExists);
    }

    await withTransaction(async (trans) => {
      await this.createAntigens([params.name], null, trans);
    });
    response.success(res);
  };

  getListAntigen = async (req: Request, res: Response) => {
    const antigens = await ImmunizationRepository.findTotalAntigen();

    response.success(res, antigens.map(antigenSerializer));
  };

  updateAntigen = async (req: Request<{}, {}, CreateNewAntigenParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const existedAntigen = await ImmunizationRepository.findAntigenById(id);

    if (!existedAntigen) {
      throw new NotFoundError(messages.antigen.notFound);
    }

    const duplicatedAntigen = await ImmunizationRepository.findAntigenByName(req.body.name);
    if (duplicatedAntigen) {
      throw new BadRequestError(messages.antigen.alreadyExists);
    }

    await withTransaction(async (trans) => {
      await this.updateAntigenService(existedAntigen, { name: req.body.name }, trans);
    });

    response.success(res);
  };

  deleteAntigen = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const existedAntigen = await ImmunizationRepository.findAntigenById(id);

    if (!existedAntigen) {
      throw new NotFoundError(messages.antigen.notFound);
    }

    await withTransaction(async (trans) => {
      await this.destroyAntigenService(existedAntigen, trans);
    });

    response.success(res);
  };
}

export default new ImmunizationController();
