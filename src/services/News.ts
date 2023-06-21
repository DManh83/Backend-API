import _ from 'lodash';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';

import { NewsCreation, UpdateCategoryParams, UpdateNewsParams } from '../interfaces/News';
import CategoryModel from '../models/Category';
import NewsModel from '../models/News';
import NewsCategoryModel from '../models/NewsCategory';
import NewsReleasedModel from '../models/NewsReleased';
import UserCategoryModel from '../models/UserCategory';

class NewsServices {
  public createNewsService = async (data: Partial<NewsCreation>, transaction: Transaction) =>
    NewsModel.create(data as NewsCreation, { transaction });

  public updateNewsService = async (news: NewsModel, newData: UpdateNewsParams, transaction: Transaction) => {
    for (const [key, value] of Object.entries(newData)) {
      news[key] = value;
    }
    return news.save({ transaction });
  };

  public updateCategoryInNews = async (newsId: string, categoryIds: string[], transaction: Transaction) => {
    const currentNewsCategory = await NewsCategoryModel.findAll({
      where: {
        newsId,
      },
    });

    const oldNewsCategory = currentNewsCategory
      .filter((newsCategory) => !categoryIds.find((id) => id === newsCategory.categoryId))
      .map((newsCategory) => newsCategory.id);

    const newCategories = categoryIds
      .filter((id) => !currentNewsCategory.find((newsCategory) => newsCategory.categoryId === id))
      .map((categoryId) => ({
        id: uuidv4(),
        newsId,
        categoryId,
      }));

    await NewsCategoryModel.bulkCreate(newCategories, { transaction });
    await NewsCategoryModel.destroy({
      where: {
        id: {
          [Op.in]: oldNewsCategory,
        },
      },
      transaction,
    });
  };

  public addCategoriesToNews = async (categoryIds: string[], newsId: string, transaction: Transaction) => {
    const existedNewsCategory = await NewsCategoryModel.findAll({
      where: {
        newsId,
        categoryId: {
          [Op.in]: categoryIds,
        },
      },
    });
    const addingIds = categoryIds.filter((id) => !existedNewsCategory.find((newsCategory) => newsCategory.categoryId === id));

    const newNewsCategoryData = addingIds.map((categoryId) => ({
      id: uuidv4(),
      categoryId,
      newsId,
    }));

    await NewsCategoryModel.bulkCreate(newNewsCategoryData, { transaction });
  };

  public destroyNews = async (id: string, transaction: Transaction) =>
    NewsModel.destroy({
      where: {
        id,
      },
      transaction,
    });

  public createCategoryService = async (category: string, transaction: Transaction) => {
    const newCategory = { name: category.trim(), isDeleted: false };
    return CategoryModel.create(newCategory, { transaction });
  };

  public updateCategoryService = async (category: CategoryModel, newData: UpdateCategoryParams, transaction: Transaction) => {
    newData.name = newData.name.trim();
    for (const [key, value] of Object.entries(newData)) {
      category[key] = value;
    }

    return category.save({ transaction });
  };

  public destroyCategory = async (id: string, transaction: Transaction) =>
    CategoryModel.destroy({
      where: {
        id,
      },
      transaction,
    });

  public updateUserCategoryService = async (categoryIds: string[], userId: string, transaction: Transaction) => {
    const currentUserCategory = await UserCategoryModel.findAll({
      where: {
        userId,
      },
    });

    const oldUserCategory = currentUserCategory
      .filter((userCategory) => !categoryIds.find((id) => id === userCategory.categoryId))
      .map((userCategory) => userCategory.id);

    const newCategories = categoryIds
      .filter((id) => !currentUserCategory.find((userCategory) => userCategory.categoryId === id))
      .map((categoryId) => ({
        id: uuidv4(),
        userId,
        categoryId,
      }));

    await UserCategoryModel.bulkCreate(newCategories, { transaction });
    await UserCategoryModel.destroy({
      where: {
        id: {
          [Op.in]: oldUserCategory,
        },
      },
      transaction,
    });
  };

  public addNewsReleased = async (newsId: string, categoryIds: string[], transaction: Transaction) => {
    await NewsReleasedModel.destroy({
      where: {
        newsId,
      },
      transaction,
    });
    const userSubscribedCategory = await UserCategoryModel.findAll({
      where: {
        categoryId: {
          [Op.in]: categoryIds,
        },
      },
    });
    const userNotified = userSubscribedCategory.map((userSubscribed) => userSubscribed.userId);
    const uniqueUserNotified = _.uniq(userNotified).map((userId) => ({
      id: uuidv4(),
      userId,
      newsId,
    }));
    await NewsReleasedModel.bulkCreate(uniqueUserNotified, { transaction });
  };

  public removeNewsReleased = async (newsId: string, transaction: Transaction) =>
    NewsReleasedModel.destroy({
      where: {
        newsId,
      },
      transaction,
    });

  public removeNewsReleaseBaseOnCategory = async (categoryId: string) => {
    const newsContainCategory = await NewsCategoryModel.findAll({
      where: {
        categoryId,
      },
    });
    const newsContainIds = newsContainCategory.map((newsContain) => newsContain.newsId);
    const newsContainIdsAndReleased = await NewsReleasedModel.findAll({
      where: {
        newsId: {
          [Op.in]: newsContainIds,
        },
      },
    });
    const newsContainAndReleasedIds = newsContainIdsAndReleased.map((newsContainAndRelease) => newsContainAndRelease.newsId);
    const uniqueNewsContainAndReleasedIds = _.uniq(newsContainAndReleasedIds);
    await Promise.all(
      uniqueNewsContainAndReleasedIds.map(async (newsId) => {
        const categoriesBelongToNews = await NewsCategoryModel.findAll({
          where: {
            newsId,
          },
        });
        const categoriesBelongToNewsIds = categoriesBelongToNews
          .map((cateNews) => cateNews.categoryId)
          .filter((cate) => cate !== categoryId);
        if (categoriesBelongToNewsIds.length === 0) {
          await NewsReleasedModel.destroy({
            where: {
              newsId,
            },
          });
        } else {
          const usersHaveNewsReleased = await NewsReleasedModel.findAll({
            where: {
              newsId,
            },
          });
          const usersHaveNewsReleasedIds = usersHaveNewsReleased.map((user) => user.userId);
          await Promise.all(
            usersHaveNewsReleasedIds.map(async (userId) => {
              const userHasOtherCategories = await UserCategoryModel.findAll({
                where: {
                  userId,
                  categoryId: {
                    [Op.in]: categoriesBelongToNewsIds,
                  },
                },
              });
              if (userHasOtherCategories.length === 0) {
                await NewsReleasedModel.destroy({
                  where: {
                    userId,
                    newsId,
                  },
                });
              }
            })
          );
        }
      })
    );
  };

  public readAllNewsReleased = async (userId: string, transaction: Transaction) =>
    NewsReleasedModel.destroy({
      where: {
        userId,
      },
      transaction,
    });
}

export default NewsServices;
