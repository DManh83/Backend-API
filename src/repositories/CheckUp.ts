import { get, has, uniq } from 'lodash';
import { col, fn, Includeable, Op, where, WhereOptions } from 'sequelize';

import { countries } from '../common/constants';
import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import {
  CheckUpAttributes,
  CheckUpFileAttributes,
  CheckUpFileCreation,
  CheckUpVersionAttributes,
  GetCheckUpVersionListParams,
  GetListCheckUpFilesParams,
  GetListCheckUpParams,
} from '../interfaces/CheckUp';
import CheckUpModel from '../models/CheckUp';
import CheckUpFileModel from '../models/CheckUpFile';
import CheckUpSchedule from '../models/CheckUpSchedule';
import CheckUpVersionModel from '../models/CheckUpVersion';
import HealthDocumentModel from '../models/HealthDocument';
import UserCheckUpVersionModel from '../models/UserCheckUpVersion';

class CheckUpRepository {
  getVersionById = (id: string) =>
    CheckUpVersionModel.findOne({
      where: { id },
    });

  getScheduleById = (id: string, includeCheckUp?: boolean) => {
    const include: Includeable | Includeable[] = [];
    if (includeCheckUp) {
      include.push({
        model: CheckUpModel,
        as: 'checkUp',
        required: false,
      });
    }
    return CheckUpSchedule.findOne({
      where: {
        id,
      },
      include,
    });
  };

  getCheckUpById = (id: string, includeSchedule?: boolean) => {
    const include: Includeable | Includeable[] = [];

    if (includeSchedule) {
      include.push({
        model: CheckUpSchedule,
        as: 'schedule',
        required: false,
      });
    }
    return CheckUpModel.findOne({
      where: {
        id,
      },
      include,
    });
  };

  getCheckUpFileByIds = (ids: string[], userId: string) =>
    CheckUpFileModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        userId,
      },
    });

  findVersionByName = (name: string, babyBookId: string) =>
    CheckUpVersionModel.findOne({
      where: {
        babyBookId: {
          [Op.or]: [null, babyBookId],
        },
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  findVersionWithPagination = ({ userId, paginationParams }: { userId: string; paginationParams: GetCheckUpVersionListParams }) => {
    const userIdCond = paginationParams.userId
      ? {
          userId,
        }
      : {
          userId: {
            [Op.or]: [null, userId],
          },
        };

    const versionCond: WhereOptions<CheckUpVersionAttributes> = {
      ...userIdCond,
      isDeleted: false,
    };

    if (has(paginationParams, 'isSuggested')) {
      versionCond.isSuggested = paginationParams.isSuggested;
    }
    if (has(paginationParams, 'babyBookId') && paginationParams.babyBookId) {
      versionCond.babyBookId = {
        [Op.or]: [null, paginationParams.babyBookId],
      };
    }
    if (has(paginationParams, 'isReleased')) {
      versionCond.isReleased = paginationParams.isReleased;
    }

    if (paginationParams.sortBy && paginationParams.sortDirection) {
      paginationParams.order = [
        [paginationParams.sortBy, paginationParams.sortDirection],
        ['created_at', 'DESC'],
      ];
    }

    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<CheckUpVersionModel>(CheckUpVersionModel)({
      ...paginateOptions,
      where: { ...versionCond },
    });
  };

  findSelectedVersion = async (userId: string, babyBookId: string) =>
    UserCheckUpVersionModel.findAll({
      where: {
        userId,
        babyBookId,
      },
      include: [
        {
          model: CheckUpVersionModel,
          as: 'version',
          required: false,
        },
      ],
    });

  findCheckUpWithPagination = async (userId: string, listParams: GetListCheckUpParams) => {
    const { checkUpVersionId, babyBookId, page = 1, pageSize = 40, order, searchValue } = listParams;
    const offset = pageSize * (page > 0 ? page - 1 : 0);

    const checkUpCond: WhereOptions<CheckUpAttributes> = {
      userId: {
        [Op.or]: [userId, null],
      },
      checkUpVersionId,
    };

    if (searchValue) {
      checkUpCond.title = { [Op.iLike]: `%${searchValue}%` };
    }

    return CheckUpModel.findAndCountAll({
      where: {
        ...checkUpCond,
      },
      include: [
        {
          model: CheckUpSchedule,
          as: 'schedule',
          where: {
            babyBookId,
          },
        },
      ],
      limit: pageSize,
      offset,
      order: order || [[listParams.sortBy || 'month_due', listParams.sortDirection || 'ASC']],
    });
  };

  findCheckUpFileWithPagination = async ({ userId, paginationParams }: { userId: string; paginationParams: GetListCheckUpFilesParams }) => {
    const checkUpFileCond: WhereOptions<CheckUpFileAttributes> = {
      userId,
      isDeleted: paginationParams.isDeleted || false,
    };

    if (paginationParams.checkUpScheduleId) {
      checkUpFileCond.checkUpScheduleId = paginationParams.checkUpScheduleId;
    }
    if (paginationParams.checkUpVersionId) {
      checkUpFileCond.checkUpVersionId = paginationParams.checkUpVersionId;
    }

    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<CheckUpFileModel>(CheckUpFileModel)({
      ...paginateOptions,
      where: { ...checkUpFileCond },
    });
  };

  findVersionByCountryCode = async (countryCode: string) => {
    const country = get(countries, countryCode.toUpperCase());
    if (!country) {
      return null;
    }

    return CheckUpVersionModel.findAll({
      where: {
        isSuggested: true,
        isReleased: true,
        name: country,
        isDeleted: false,
      },
    });
  };

  findDuplicatedFilename = async (fileIds: string[], checkUpScheduleId?: string) => {
    const duplicatedNames = [];

    const validatingFiles = await CheckUpFileModel.findAll({
      where: {
        id: {
          [Op.in]: fileIds,
        },
      },
    });
    const validNames: string[] = [];

    validatingFiles.forEach((file) => {
      if (validNames.includes(file.filename)) {
        duplicatedNames.push(file.filename);
      } else {
        validNames.push(file.filename.trim().toLowerCase());
      }
    });

    if (duplicatedNames.length || !checkUpScheduleId) return duplicatedNames;

    const duplicatedFiles = await CheckUpFileModel.findAll({
      where: {
        checkUpScheduleId,
        filename: where(fn('LOWER', col('filename')), {
          [Op.in]: validNames,
        }),
      },
    });

    return uniq(duplicatedFiles.map((file) => file.filename));
  };

  findAllVersionWithCheckUps = async () =>
    CheckUpVersionModel.findAll({
      where: {
        isSuggested: true,
        isDeleted: false,
      },
      include: [
        {
          model: CheckUpModel,
          as: 'checkUp',
          required: false,
        },
      ],
    });

  findVersionByYear = async ({ name, source, version, year }: { name: string; source: string; version: string; year: number }) =>
    CheckUpVersionModel.findOne({ where: { name, year, source, version } });

  findCheckUpByTitle = async (babyBookIds: string[], title: string) =>
    CheckUpSchedule.findAll({
      where: {
        babyBookId: {
          [Op.in]: [...babyBookIds],
        },
        isDeleted: false,
      },
      include: [
        {
          model: CheckUpModel,
          as: 'checkUp',
          required: false,
          where: {
            title: {
              [Op.iLike]: `%${title}%`,
            },
          },
        },
      ],
    });

  public findDuplicatedFileNameInHealthFolder = async (fileNames: string[], healthFolderId: string) =>
    HealthDocumentModel.findAll({
      where: {
        healthFolderId,
        filename: where(fn('LOWER', col('filename')), {
          [Op.in]: fileNames,
        }),
      },
    });

  findDocumentsByFile = (babyBookIds: string[], value: string) => {
    const searchCond: WhereOptions<CheckUpFileAttributes | CheckUpFileCreation> = {
      babyBookId: {
        [Op.in]: [...babyBookIds],
      },
      [Op.or]: [
        {
          translatedText: {
            [Op.iLike]: `%${value}%`,
          },
        },
        {
          filename: { [Op.iLike]: `%${value}%` },
        },
      ],
      isDeleted: false,
    };

    return CheckUpFileModel.findAll({
      where: searchCond,
      include: [
        {
          model: CheckUpSchedule,
          as: 'fileSchedule',
          include: [
            {
              model: CheckUpModel,
              as: 'checkUp',
              required: false,
            },
          ],
        },
      ],
    });
  };
}

export default new CheckUpRepository();
