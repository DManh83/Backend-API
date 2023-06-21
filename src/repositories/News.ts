import { isNil, omitBy, uniq } from 'lodash';
import { col, FindOptions, fn, Op, where, WhereOptions } from 'sequelize';

import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import { GetNewsListParams, GetPublicNews, NewsAttributes, NewsCreation } from '../interfaces/News';
import CategoryModel from '../models/Category';
import NewsModel from '../models/News';
import NewsCategoryModel from '../models/NewsCategory';
import NewsReleasedModel from '../models/NewsReleased';
import UserCategoryModel from '../models/UserCategory';

class NewsRepository {
  getNewsById = (id: string) =>
    NewsModel.findOne({
      where: { id },
      include: [
        {
          model: NewsCategoryModel,
          as: 'newsCategory',
          required: false,
          include: [
            {
              model: CategoryModel,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
    });

  getPublicNewsById = (id: string) =>
    NewsModel.findOne({
      where: { id, isPublic: true, isPublished: true },
      include: [
        {
          model: NewsCategoryModel,
          as: 'newsCategory',
          required: false,
          include: [
            {
              model: CategoryModel,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
    });

  findNewsWithPaginationMember = ({ paginationParams }: { paginationParams: GetNewsListParams }) => {
    const newsCond: WhereOptions<NewsAttributes> = {
      isDeleted: paginationParams.isDeleted || false,
      isPublished: true,
    };

    paginationParams.order = [['updated_at', 'DESC']];

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      newsCond[Op.or] = {
        title: { [Op.iLike]: `%${paginationParams.searchValue}%` },
      };
    }

    return withPaginate<NewsModel>(NewsModel)({
      ...paginateOptions,
      where: { ...newsCond },
      include: [
        {
          model: NewsCategoryModel,
          as: 'newsCategory',
          required: false,
          include: [
            {
              model: CategoryModel,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
    });
  };

  findNewsWithPaginationAdmin = ({ userId, paginationParams }: { userId?: string; paginationParams: GetNewsListParams }) => {
    const newsCond: WhereOptions<NewsAttributes> = userId
      ? {
          userId,
          isDeleted: paginationParams.isDeleted || false,
        }
      : {
          isDeleted: paginationParams.isDeleted || false,
        };

    paginationParams.order = [['updated_at', 'DESC']];

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      newsCond[Op.or] = {
        title: { [Op.iLike]: `%${paginationParams.searchValue}%` },
      };
    }

    return withPaginate<NewsModel>(NewsModel)({
      ...paginateOptions,
      where: { ...newsCond },
      include: [
        {
          model: NewsCategoryModel,
          as: 'newsCategory',
          required: false,
          include: [
            {
              model: CategoryModel,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
    });
  };

  getCategoryByIds = (ids: string[], userId?: string) => {
    const otherCond = {
      userId,
    };
    return CategoryModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        ...omitBy(otherCond, isNil),
      },
    });
  };

  getCategoryById = (id: string) =>
    CategoryModel.findOne({
      where: { id },
    });

  findCategoryByName = async (name: string) =>
    CategoryModel.findOne({
      where: {
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  findCategories = async () => CategoryModel.findAll();

  findCategoriesByUser = async (userId: string) =>
    UserCategoryModel.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: CategoryModel,
          as: 'category',
          required: false,
        },
      ],
    });

  countTotalNewReleased = async (userId: string) => {
    const newsReleased = await NewsReleasedModel.count({
      where: {
        userId,
      },
    });
    return newsReleased;
  };

  getPublicNews = async (params: GetPublicNews) => {
    const { page = 1, pageSize = 40, categoryIds, searchValue, except } = params;
    const offset = pageSize * (page > 0 ? page - 1 : 0);

    const whereCondition: WhereOptions<NewsAttributes> = {
      isPublished: true,
      isPublic: true,
      id: {
        [Op.ne]: except || null,
      },
    };

    const options: FindOptions<NewsAttributes | NewsCreation> = {
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: NewsCategoryModel,
          as: 'newsCategory',
          required: false,
          include: [
            {
              model: CategoryModel,
              as: 'category',
              required: false,
            },
          ],
        },
      ],
    };

    if (categoryIds?.length) {
      const newsCategories = await NewsCategoryModel.findAll({
        where: {
          categoryId: {
            [Op.in]: categoryIds,
          },
        },
      });

      const ids = uniq(newsCategories.map((nc) => nc.newsId).filter((id) => id !== except));

      whereCondition.id = {
        [Op.and]: [
          {
            [Op.in]: ids,
          },
          {
            [Op.ne]: except || null,
          },
        ],
      };
    }

    if (searchValue) {
      whereCondition[Op.or] = [{ title: { [Op.iLike]: `${searchValue}%` } }, { content: { [Op.iLike]: `${searchValue}%` } }];
    }

    return NewsModel.findAll({
      where: {
        ...whereCondition,
      },
      ...options,
    });
  };
}

export default new NewsRepository();
