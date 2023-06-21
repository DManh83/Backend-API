import { flattenDeep, has, isEmpty, uniq } from 'lodash';
import { FindOptions, literal, Op } from 'sequelize';
import { WhereOptions } from 'sequelize/types';

import { SharingRole } from '../common/enum';
import { PaginationParams } from '../common/helpers/pagination/types';
import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import {
  BabyBookAttributes,
  BabyBookCreation,
  BabyBookSearchParams,
  CheckDuplicatedSharedBooks,
  CountBabyBookParams,
  SharingSessionAttributes,
  SharingSessionCreation,
} from '../interfaces/BabyBook';
import BabyBookModel from '../models/BabyBook';
import SharingChangeModel from '../models/SharingChange';
import SharingSessionModel from '../models/SharingSession';
import SharingSessionBabyBookModel from '../models/SharingSessionBabyBook';

class BabyBookRepository {
  async findWithPagination({ userId, paginationParams }: { userId: string; paginationParams: BabyBookSearchParams }) {
    const babyBookCond: WhereOptions<BabyBookAttributes> = { userId, isDeleted: paginationParams.isDeleted || false };
    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      babyBookCond.name = { [Op.iLike]: `%${paginationParams.searchValue}%` };
    }

    return withPaginate<BabyBookModel>(BabyBookModel)({
      ...paginateOptions,
      where: { ...babyBookCond },
    });
  }

  getTotalBabyBook = async (queries: CountBabyBookParams) => {
    if (isEmpty(queries)) {
      const total = await BabyBookModel.count();
      return { total };
    }

    const whereCond: WhereOptions<BabyBookAttributes | BabyBookCreation> = {
      createdAt: {
        [Op.gte]: new Date(queries.from),
        [Op.lt]: new Date(queries.to),
      },
    };

    let viewBy = 'year';

    switch (queries.viewBy) {
      case 'year':
        viewBy = 'month';
        break;
      case 'month':
        viewBy = 'week';
        break;
      case 'week':
        viewBy = 'day';
        break;

      default:
        break;
    }

    return BabyBookModel.findAll({
      where: whereCond,
      attributes: [
        [literal(`date_trunc('${viewBy}', created_at)`), 'date'],
        [literal(`COUNT(*)`), 'count'],
      ],
      group: ['date'],
    });
  };

  findBabyBookByIds = async (ids: string[], filter: Partial<BabyBookCreation> | undefined = {}) => {
    const whereCond: WhereOptions<BabyBookAttributes | BabyBookCreation> = {};
    if (has(filter, 'userId')) {
      whereCond.userId = filter.userId;
    }
    if (filter.name?.trim()) {
      whereCond.name = { [Op.iLike]: `%${filter.name}%` };
    }

    return BabyBookModel.findAll({ where: { id: { [Op.in]: ids }, ...whereCond }, order: [['created_at', 'DESC']] });
  };

  findSharingSessionById = async (id: string, includeBabyBook = false) => {
    const options: FindOptions<SharingSessionAttributes | SharingSessionCreation> = {};
    if (includeBabyBook) {
      options.include = [
        {
          model: SharingSessionBabyBookModel,
          as: 'sessionBabyBook',
          required: false,
        },
      ];
    }

    return SharingSessionModel.findOne({ where: { id }, ...options });
  };

  findSharedBabyBooksOfUser = async (email: string) => {
    const sessions = await SharingSessionModel.findAll({
      where: {
        email,
        role: SharingRole.EDITOR,
        availableAfter: { [Op.ne]: null },
        expiredAfter: {
          [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
        },
      },
      include: [
        {
          model: SharingSessionBabyBookModel,
          as: 'sessionBabyBook',
          required: false,
        },
      ],
    });

    const bookIds = uniq(flattenDeep(sessions.map((session) => session.sessionBabyBook.map((sb) => sb.babyBookId))));

    return bookIds;
  };

  paginateSharingSession = async (userId: string, params: PaginationParams) => {
    const sessionCond: WhereOptions<SharingSessionAttributes> = { userId };

    const paginateOptions = getPaginateOptions(params);

    return withPaginate<SharingSessionModel>(SharingSessionModel)({
      ...paginateOptions,
      where: { ...sessionCond },
      include: [
        {
          model: SharingSessionBabyBookModel,
          as: 'sessionBabyBook',
          required: false,
          include: [
            {
              model: BabyBookModel,
              as: 'sharedBabyBook',
              required: false,
            },
          ],
        },
      ],
    });
  };

  findByUserId = async (userId: string, params: BabyBookSearchParams) =>
    BabyBookModel.findAll({ where: { userId, isDeleted: params.isDeleted || false }, order: [['created_at', 'DESC']] });

  findById = async (id: string) => BabyBookModel.findOne({ where: { id } });

  getSharingChangesWithPagination = (userId: string, params: PaginationParams) => {
    const paginateOptions = getPaginateOptions(params);

    return withPaginate<SharingChangeModel>(SharingChangeModel)({
      ...paginateOptions,
      where: { userId },
      include: [
        {
          model: BabyBookModel,
          as: 'babyBook',
          required: false,
        },
      ],
    });
  };

  getDuplicatedSharedBooks = async (userId: string, params: CheckDuplicatedSharedBooks) => {
    const { email, babyBookIds } = params;

    const sessions = await SharingSessionModel.findAll({
      where: {
        userId,
        email,
        expiredAfter: {
          [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }],
        },
      },
      include: [
        {
          model: SharingSessionBabyBookModel,
          as: 'sessionBabyBook',
          required: true,
          where: {
            babyBookId: {
              [Op.in]: babyBookIds,
            },
          },
          include: [
            {
              model: BabyBookModel,
              as: 'sharedBabyBook',
              required: false,
            },
          ],
        },
      ],
    });

    return sessions;
  };
}

export default new BabyBookRepository();
