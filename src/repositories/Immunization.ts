import { get, has } from 'lodash';
import { col, fn, Op, where, WhereOptions } from 'sequelize';

import { countries } from '../common/constants';
import { PaginationParams } from '../common/helpers/pagination/types';
import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import {
  AntigenAttributes,
  CreateNewVaccinationParams,
  GetListImmunizationParams,
  GetVaccinationListParams,
  VaccinationAttributes,
} from '../interfaces/Immunization';
import AntigenModel from '../models/Antigen';
import ImmunizationModel from '../models/Immunization';
import ImmunizationAntigenModel from '../models/ImmunizationAntigen';
import ImmunizationScheduleModel from '../models/ImmunizationSchedule';
import UserVaccinationModel from '../models/UserVaccination';
import VaccinationModel from '../models/Vaccination';

class ImmunizationRepository {
  getVaccinationById = (id: string) =>
    VaccinationModel.findOne({
      where: { id },
    });

  findVaccinationByVersion = ({ name, code, year, indigenous, medicalCondition }: CreateNewVaccinationParams) =>
    VaccinationModel.findOne({
      where: {
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
        code,
        year,
        indigenous,
        medicalCondition,
      },
    });

  getScheduleById = (id: string) =>
    ImmunizationScheduleModel.findOne({
      where: {
        id,
      },
    });

  getScheduleByIds = (ids: string[]) =>
    ImmunizationScheduleModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

  getImmunizationById = (id: string) =>
    ImmunizationModel.findOne({
      where: {
        id,
      },
    });

  findImmunizationByVaccination = async (vaccinationId: string, monthOld: number) =>
    ImmunizationModel.findAll({
      where: {
        vaccinationId,
        monthOld,
        isSuggested: true,
      },
    });

  findVaccinationByName = (name: string, babyBookId) =>
    VaccinationModel.findOne({
      where: {
        babyBookId: {
          [Op.or]: [null, babyBookId],
        },
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  findVaccinationWithPagination = ({ userId, paginationParams }: { userId: string; paginationParams: GetVaccinationListParams }) => {
    const userIdCond = paginationParams.userId
      ? {
          userId,
        }
      : {
          userId: {
            [Op.or]: [null, userId],
          },
        };

    const vaccinationCond: WhereOptions<VaccinationAttributes> = {
      ...userIdCond,
      isDeleted: false,
    };

    if (has(paginationParams, 'isSuggested')) {
      vaccinationCond.isSuggested = paginationParams.isSuggested;
    }
    if (has(paginationParams, 'isReleased')) {
      vaccinationCond.isReleased = paginationParams.isReleased;
    }
    if (has(paginationParams, 'babyBookId')) {
      vaccinationCond.babyBookId = {
        [Op.or]: [null, paginationParams.babyBookId],
      };
    }

    if (paginationParams.sortBy) {
      paginationParams.order = [
        [paginationParams.sortBy, paginationParams.sortDirection],
        ['created_at', 'DESC'],
      ];
    }

    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<VaccinationModel>(VaccinationModel)({
      ...paginateOptions,
      where: { ...vaccinationCond },
    });
  };

  getAllVaccinationWithImmunization = async () =>
    VaccinationModel.findAll({
      where: {
        isSuggested: true,
        isDeleted: false,
      },
      include: [
        {
          model: ImmunizationModel,
          as: 'immunization',
          required: false,
          include: [
            {
              model: ImmunizationAntigenModel,
              as: 'immunizationAntigen',
              required: false,
              include: [
                {
                  model: AntigenModel,
                  as: 'antigen',
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

  getAllImmunizationByVaccination = async (userId: string, listParams: GetListImmunizationParams) => {
    const { vaccinationId, babyBookId } = listParams;

    return ImmunizationModel.findAll({
      where: {
        userId: {
          [Op.or]: [userId, null],
        },
        vaccinationId,
      },
      include: [
        {
          model: ImmunizationScheduleModel,
          as: 'schedule',
          required: false,
          where: {
            babyBookId,
          },
        },
        {
          model: ImmunizationAntigenModel,
          as: 'immunizationAntigen',
          required: false,
          include: [
            {
              model: AntigenModel,
              as: 'antigen',
              required: false,
            },
          ],
        },
      ],
    });
  };

  findSelectedVaccination = async (userId: string, babyBookId: string) =>
    UserVaccinationModel.findAll({
      where: {
        userId,
        babyBookId,
      },
      include: [
        {
          model: VaccinationModel,
          as: 'vaccination',
          required: false,
        },
      ],
    });

  findImmunizationWithPagination = async (userId: string, listParams: GetListImmunizationParams) => {
    const { vaccinationId, babyBookId, page = 1, pageSize = 40, searchValue } = listParams;
    const offset = pageSize * (page > 0 ? page - 1 : 0);

    const antigenCond: WhereOptions<AntigenAttributes> = {};
    if (listParams.searchValue) {
      antigenCond.name = { [Op.iLike]: `%${searchValue}%` };
    }

    return ImmunizationModel.findAndCountAll({
      where: {
        userId: {
          [Op.or]: [userId, null],
        },
        vaccinationId,
      },
      include: [
        {
          model: ImmunizationScheduleModel,
          as: 'schedule',
          required: false,
          where: {
            babyBookId,
          },
        },
        {
          model: ImmunizationAntigenModel,
          as: 'immunizationAntigen',
          required: true,
          duplicating: false,
          include: [
            {
              model: AntigenModel,
              as: 'antigen',
              required: true,
              where: { ...antigenCond },
            },
          ],
        },
      ],
      limit: pageSize,
      offset,
      order: [[listParams.sortBy || 'month_old', listParams.sortDirection || 'ASC']],
    });
  };

  findVaccinationByCountryCode = async (countryCode: string) => {
    const country = get(countries, countryCode.toUpperCase());
    if (!country) {
      return null;
    }

    return VaccinationModel.findAll({
      where: {
        isSuggested: true,
        isReleased: true,
        country,
        isDeleted: false,
      },
    });
  };

  findAntigenByName = async (name: string) =>
    AntigenModel.findOne({
      where: {
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  findAntigenWithPagination = (paginationParams: PaginationParams) => {
    const vaccinationCond: WhereOptions<AntigenAttributes> = {
      userId: null,
    };

    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<AntigenModel>(AntigenModel)({
      ...paginateOptions,
      where: { ...vaccinationCond },
    });
  };

  findAntigenById = async (id: string) => AntigenModel.findOne({ where: { id } });

  findTotalAntigen = async () => AntigenModel.findAll({ where: { userId: null }, order: [['updated_at', 'DESC']] });

  findImmunizationByValue = async (babyBookIds: string[], value: string) =>
    ImmunizationScheduleModel.findAll({
      where: {
        babyBookId: {
          [Op.in]: [...babyBookIds],
        },
        isDeleted: false,
      },
      include: [
        {
          model: ImmunizationModel,
          as: 'immunizations',
          include: [
            {
              model: ImmunizationAntigenModel,
              as: 'immunizationAntigen',
              include: [
                {
                  model: AntigenModel,
                  as: 'antigen',
                  where: {
                    name: {
                      [Op.iLike]: `%${value}%`,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
}

export default new ImmunizationRepository();
