import { get, has } from 'lodash';
import { fn, where, col, Op, literal, QueryInterface, Includeable } from 'sequelize';
import { WhereOptions } from 'sequelize/types';

import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import {
  MilestoneAlbumAttributes,
  MilestoneAlbumSearchParams,
  MilestoneAttributes,
  MilestoneBehaviorListParams,
  MilestonePhotoAttributes,
  MilestonePhotosParams,
  MilestoneSearchParams,
} from '../interfaces/Milestone';
import MilestoneModel from '../models/Milestone';
import MilestoneAlbumModel from '../models/MilestoneAlbum';
import MilestonePhotoModel from '../models/MilestonePhoto';
import MilestoneStandardAgeModel from '../models/MilestoneStandardAge';
import MilestoneStandardBehaviorModel from '../models/MilestoneStandardBehavior';
import MilestoneStandardGroupModel from '../models/MilestoneStandardGroup';

class MilestoneRepository {
  async getGroups() {
    return MilestoneStandardGroupModel.findAll();
  }

  public findGroupByName = async (name: string) =>
    MilestoneStandardGroupModel.findOne({
      where: {
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  async getAges(groupId?: string) {
    let options = {};
    if (groupId) {
      const existedBehavior = await MilestoneStandardBehaviorModel.findAll({
        where: {
          groupId,
        },
        group: ['ageId'],
        attributes: ['ageId'],
      });

      const ids = existedBehavior.map((behavior) => behavior.ageId);

      options = {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      };
    }
    return MilestoneStandardAgeModel.findAll(options);
  }

  public findAge = async (age: { day: number; month: number; year: number }) =>
    MilestoneStandardAgeModel.findOne({ where: { day: age.day || 0, month: age.month || 0, year: age.year || 0 } });

  async getBehaviors(params: MilestoneBehaviorListParams) {
    return MilestoneStandardBehaviorModel.findAll({
      where: {
        ageId: params.ageId,
        groupId: params.groupId,
      },
    });
  }

  public findBehavior = async (groupId: string, ageId: string, behavior: string) =>
    MilestoneStandardBehaviorModel.findOne({ where: { groupId, ageId, behavior } });

  public findBehaviorById = async (id: string) => {
    if (id) {
      return MilestoneStandardBehaviorModel.findOne({
        where: { id },
        include: [
          {
            model: MilestoneStandardAgeModel,
            as: 'age',
            required: false,
          },
          {
            model: MilestoneStandardGroupModel,
            as: 'group',
            required: false,
          },
        ],
      });
    }
  };

  public findBehaviorByIds = async (ids: string[]) =>
    MilestoneStandardBehaviorModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

  public getBehaviorsByGroupId = async (groupId: string) =>
    MilestoneStandardAgeModel.findAll({
      include: [
        {
          model: MilestoneStandardBehaviorModel,
          as: 'behavior',
          required: false,
          where: {
            groupId,
          },
        },
      ],
    });

  async getMilestonePhotos(milestoneId: string) {
    return MilestonePhotoModel.findAll({
      where: {
        milestoneId,
      },
    });
  }

  async findAlbumByName(userId: string, babyBookId: string, name: string) {
    return MilestoneAlbumModel.findOne({
      where: {
        userId,
        babyBookId,
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });
  }

  async findAlbumSearchValue(babyBookIds: string[], name: string) {
    return MilestoneAlbumModel.findAll({
      where: {
        babyBookId: {
          [Op.in]: [...babyBookIds],
        },
        name: {
          [Op.iLike]: `%${name}%`,
        },
        isDeleted: false,
      },
    });
  }

  async findAlbumById(id: string) {
    return MilestoneAlbumModel.findOne({
      where: {
        id,
      },
    });
  }

  async findMilestoneById(id: string, includeAlbum?: boolean) {
    const includes: Includeable[] = [
      {
        model: MilestoneStandardBehaviorModel,
        as: 'behavior',
        required: false,
        include: [
          {
            model: MilestoneStandardAgeModel,
            as: 'age',
            required: false,
          },
          {
            model: MilestoneStandardGroupModel,
            as: 'group',
            required: false,
          },
        ],
      },
    ];

    if (includeAlbum) {
      includes.push({
        model: MilestoneAlbumModel,
        as: 'album',
        required: false,
      });
    }

    return MilestoneModel.findOne({
      where: {
        id,
      },
      include: includes,
    });
  }

  async findMilestoneWithPaginate({ albumId, paginationParams }: { albumId: string; paginationParams: MilestoneSearchParams }) {
    const milestoneCond: WhereOptions<MilestoneAttributes> = {
      albumId,
      isDeleted: paginationParams.isDeleted || false,
    };

    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<MilestoneModel>(MilestoneModel)({
      ...paginateOptions,
      where: { ...milestoneCond },
      include: [
        {
          model: MilestoneStandardBehaviorModel,
          as: 'behavior',
          required: false,
          include: [
            {
              model: MilestoneStandardAgeModel,
              as: 'age',
              required: false,
            },
          ],
        },
      ],
    });
  }

  async findAlbumWithPagination({ userId, paginationParams }: { userId: string; paginationParams: MilestoneAlbumSearchParams }) {
    const albumCond: WhereOptions<MilestoneAlbumAttributes> = {
      userId,
      babyBookId: paginationParams.babyBookId,
      isDeleted: paginationParams.isDeleted || false,
    };
    if (!paginationParams.isDeleted) {
      albumCond.isStandard = paginationParams.isStandard || false;
    }
    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      albumCond.name = { [Op.iLike]: `%${paginationParams.searchValue}%` };
    }

    return withPaginate<MilestoneAlbumModel>(MilestoneAlbumModel)({
      ...paginateOptions,
      where: { ...albumCond },
    });
  }

  async findPhotoWithPaginate({ paginationParams }: { paginationParams: MilestonePhotosParams }) {
    const photoCond: WhereOptions<MilestonePhotoAttributes> = {
      isDeleted: paginationParams.isDeleted || false,
    };
    if (paginationParams.milestoneId) {
      photoCond.milestoneId = paginationParams.milestoneId;
    }
    if (paginationParams.babyBookId) {
      photoCond.babyBookId = paginationParams.babyBookId;
    }
    if (paginationParams.albumId) {
      photoCond.milestoneAlbumId = paginationParams.albumId;
    }
    const paginateOptions = getPaginateOptions(paginationParams);

    return withPaginate<MilestonePhotoModel>(MilestonePhotoModel)({
      ...paginateOptions,
      where: { ...photoCond },
      include: [
        {
          model: MilestoneAlbumModel,
          as: 'album',
          required: false,
        },
      ],
    });
  }

  getPhotosByIds = async (ids: string[]) =>
    MilestonePhotoModel.findAll({
      where: { id: { [Op.in]: ids } },
    });

  findAllPhotos = async (params: MilestonePhotosParams) => {
    const cond: WhereOptions<MilestonePhotoAttributes> = {};

    if (has(params, 'isDeleted')) {
      cond.isDeleted = get(params, 'isDeleted');
    }

    if (params.milestoneId) {
      cond.milestoneId = params.milestoneId;
    }
    if (params.babyBookId) {
      cond.babyBookId = params.babyBookId;
    }
    if (params.albumId) {
      cond.milestoneAlbumId = params.albumId;
    }

    return MilestonePhotoModel.findAll({
      where: cond,
      include: [
        {
          model: MilestoneAlbumModel,
          as: 'album',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });
  };
}

export default new MilestoneRepository();
