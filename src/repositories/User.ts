import { isEmpty } from 'lodash';
import { literal, Op, WhereOptions } from 'sequelize';
import { CountUserParams, GetUserListParams, UserAttributes, UserCreation } from '../interfaces/User';
import SubscriptionModel from '../models/Subscription';
import UserModel from '../models/User';
import DeviceModel from '../models/DevicesKey';

class UserRepository {
  async getById(id: string) {
    return UserModel.findOne({
      where: { id },
    });
  }

  async getUserWithSubscriptionById(id: string) {
    return UserModel.findOne({
      where: { id },
      include: [
        {
          model: SubscriptionModel,
          required: false,
          as: 'subscription',
        },
      ],
    });
  }

  async getByEmailOrUsername(email: string, username: string) {
    return UserModel.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
  }

  async getByEmail(email: string) {
    return UserModel.findOne({
      where: { email },
    });
  }

  async getByPhone(phone: string) {
    return UserModel.findOne({
      where: { phone },
    });
  }

  async getSuggestion({ key }) {
    return UserModel.findAll({
      where: { [Op.or]: [{ email: { [Op.iLike]: `${key}%` }, username: { [Op.iLike]: `${key}%` } }] },
      attributes: { exclude: ['password', 'token'] },
    });
  }

  getUserWithPagination = async (params: GetUserListParams) => {
    const { page, pageSize, sortBy = 'created_at', sortDirection = 'DESC', roles, searchValue, countryCodes } = params;

    if (isEmpty(roles)) return [];

    const paginationQuery =
      pageSize && page
        ? {
            limit: pageSize,
            offset: pageSize * (page > 0 ? page - 1 : 0),
          }
        : {};

    const whereCond: WhereOptions<UserAttributes | UserCreation> = {
      role: {
        [Op.in]: roles,
      },
    };

    if (!isEmpty(countryCodes)) {
      whereCond.countryCode = {
        [Op.in]: countryCodes,
      };
    }

    if (!isEmpty(searchValue)) {
      const searchableFields = ['firstName', 'lastName', 'email', 'phone'];

      whereCond[Op.or] = searchableFields.map((field) => ({
        [field]: {
          [Op.iLike]: `%${searchValue}%`,
        },
      }));
    }

    return Promise.all([
      UserModel.findAll({
        where: whereCond,
        ...paginationQuery,
        order: [[sortBy, sortDirection]],
      }),
      UserModel.count({
        where: whereCond,
      }),
    ]);
  };

  getSubscribers = async () =>
    UserModel.findAll({
      where: {
        subscribeNewsletter: true,
      },
    });

  getTotalSubscribers = async (subscribeNewsletter: boolean) =>
    UserModel.count({
      where: {
        subscribeNewsletter,
      },
    });

  getTotalUser = async (queries: CountUserParams) => {
    if (isEmpty(queries)) {
      const total = await UserModel.count();
      return { total };
    }

    const whereCond: WhereOptions<UserAttributes | UserCreation> = {
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
    return UserModel.findAll({
      where: whereCond,
      attributes: [
        [literal(`date_trunc('${viewBy}', created_at)`), 'date'],
        [literal(`COUNT(*)`), 'count'],
      ],
      group: ['date'],
    });
  };

  haveDeviceToken = async (token: string) =>
    DeviceModel.findOne({
      where: { token },
    });
}

export default new UserRepository();
