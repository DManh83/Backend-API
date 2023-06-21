import { Request, Response } from 'express';
import { get, isEmpty } from 'lodash';
import { UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NoContentFound from '../common/errors/types/NoContent';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import imageStore from '../common/helpers/imageStore';
import { PaginationParams } from '../common/helpers/pagination/types';
import { paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import {
  CreateCategoryParams,
  CreateNewsParams,
  GetNewsByIdParams,
  GetNewsListParams,
  GetPublicNews,
  UpdateCategoryParams,
  UpdateNewsParams,
  UpdateUserCategoryParams,
} from '../interfaces/News';
import NewsRepository from '../repositories/News';
import { categorySerializer, newsSerializer, userCategorySerializer } from '../serializers/NewsSerializer';
import NewsServices from '../services/News';
import { MulterRequest } from './BabyBook';

class NewsController extends NewsServices {
  public createNews = async (req: Request<{}, {}, CreateNewsParams>, res: Response) => {
    const isEditor = req.user.role === UserRole.EDITOR;

    const { file } = req as MulterRequest;
    const recordParams = parseFormData(req.body, ['categoryIds']);

    if (isEditor && recordParams.isPublished) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    if (recordParams.categoryIds?.length) {
      const categories = await NewsRepository.getCategoryByIds(recordParams.categoryIds);
      if (categories.length !== recordParams.categoryIds.length) {
        throw new NotFoundError(messages.category.notFound);
      }
    }

    if (!file && !recordParams.coverPicture) {
      throw new NoContentFound(messages.news.noFileFound);
    }

    const newData = {
      userId: req.user.id,
      coverPicture: `${req.user.id}/${get(file, 'filename', null)}`,
      title: recordParams.title,
      author: recordParams.author,
      content: recordParams.content,
      isPublished: recordParams.isPublished || false,
      isPublic: recordParams.isPublic,
      publishAt: recordParams.isPublished ? new Date() : null,
    };

    await withTransaction(async (trans) => {
      const news = await this.createNewsService(newData, trans);

      if (recordParams.categoryIds) {
        if (recordParams.isPublished) {
          await this.addNewsReleased(news.id, recordParams.categoryIds, trans);
        }
        await this.addCategoriesToNews(recordParams.categoryIds, news.id, trans);
      }
    });
    response.success(res);
  };

  public getNewsList = async (req: Request<{}, {}, {}, GetNewsListParams>, res: Response) => {
    const userId = req.user.id;
    const listParams = parseFormData(req.query, ['isDeleted', 'isPublished', 'showAll']);
    const [news, userCategories] = await Promise.all([
      NewsRepository.findNewsWithPaginationMember({
        paginationParams: listParams,
      }),
      NewsRepository.findCategoriesByUser(userId),
    ]);

    const categoryIds = userCategorySerializer(userCategories).categories.map((cate) => cate.id);

    if (!listParams.showAll) {
      const newsList = news.list.filter((itemNews) => itemNews.item.newsCategory.some((item) => categoryIds.includes(item.categoryId)));
      news.list = newsList;
    }

    response.success(res, paginationSerializer(news, newsSerializer));
  };

  public getNewsListAdmin = async (req: Request<{}, {}, {}, GetNewsListParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);

    const news = await NewsRepository.findNewsWithPaginationAdmin({
      userId: listParams.userId,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(news, newsSerializer));
  };

  public getNewsById = async (req: Request<{}, {}, GetNewsByIdParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const news = await NewsRepository.getNewsById(id);
    if (!news) throw new NotFoundError(messages.news.notFound);

    response.success(res, newsSerializer(news));
  };

  public updateNews = async (req: Request<{}, {}, UpdateNewsParams>, res: Response) => {
    const isEditor = req.user.role === UserRole.EDITOR;
    const { file } = req as unknown as MulterRequest;
    const { id } = req.params as { id: string };
    const updateParams = parseFormData(req.body, ['isPublic', 'categoryIds', 'isPublished']);

    if (isEditor && updateParams.isPublished) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    const existedNews = await NewsRepository.getNewsById(id);
    if (!existedNews) throw new NotFoundError(messages.news.notFound);

    if (file) {
      imageStore.deletePath(existedNews.coverPicture);
      updateParams.coverPicture = `${req.user.id}/${get(file, 'filename', null)}`;
    }
    const { categoryIds, ...params } = updateParams;
    if (categoryIds?.length) {
      const categories = await NewsRepository.getCategoryByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new NotFoundError(messages.category.notFound);
      }
    }

    await withTransaction(async (trans) => {
      const newData = {
        ...params,
        isPublished: params.isPublished || false,
        publishAt: params.isPublished ? new Date() : null,
        isPublic: params.isPublic,
      };

      if (!isEmpty(newData)) {
        await this.updateNewsService(existedNews, newData, trans);
        if (newData.isPublished) {
          categoryIds.length && (await this.addNewsReleased(id, categoryIds, trans));
        } else {
          await this.removeNewsReleased(id, trans);
        }
      }
      if (categoryIds) {
        await this.updateCategoryInNews(id, categoryIds, trans);
      }
    });

    response.success(res);
  };

  public deleteNews = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const existedNews = await NewsRepository.getNewsById(id);
    if (!existedNews) throw new NotFoundError(messages.news.notFound);

    imageStore.deletePath(existedNews.coverPicture);

    await withTransaction(async (trans) => {
      await this.destroyNews(existedNews.id, trans);
    });
    response.success(res);
  };

  public createCategory = async (req: Request<{}, {}, CreateCategoryParams>, res: Response) => {
    const { body: categoryParams } = req;
    const existedCategory = await NewsRepository.findCategoryByName(categoryParams.name);
    if (existedCategory) throw new BadRequestError(messages.category.alreadyExists);
    await withTransaction(async (trans) => {
      await this.createCategoryService(categoryParams.name, trans);
    });

    response.success(res);
  };

  public getCategoryList = async (req: Request, res: Response) => {
    const categories = await NewsRepository.findCategories();

    response.success(res, categories.map(categorySerializer));
  };

  public updateCategory = async (req: Request<{}, {}, UpdateCategoryParams>, res: Response) => {
    const { body: updateParams } = req;
    const { id } = req.params as { id: string };

    const existedCategory = await NewsRepository.getCategoryById(id);
    if (!existedCategory || isEmpty(updateParams)) throw new NotFoundError(messages.category.notFound);

    const duplicatedCategory = await NewsRepository.findCategoryByName(updateParams.name);
    if (duplicatedCategory) throw new BadRequestError(messages.category.alreadyExists);

    await withTransaction(async (trans) => {
      await this.updateCategoryService(existedCategory, updateParams, trans);
    });

    response.success(res);
  };

  public deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const existedCategory = await NewsRepository.getCategoryById(id);
    if (!existedCategory) throw new NotFoundError(messages.category.notFound);

    await withTransaction(async (trans) => {
      await this.destroyCategory(existedCategory.id, trans);
      await this.removeNewsReleaseBaseOnCategory(existedCategory.id);
    });

    response.success(res);
  };

  public uploadContentFile = async (req: Request, res: Response) => {
    const { file } = req as MulterRequest;

    if (!file) {
      throw new NoContentFound(messages.news.noFileFound);
    }

    response.success(res, imageStore.getUrl(req.user.id, get(file, 'filename', null)));
  };

  public getUserCategoryList = async (req: Request, res: Response) => {
    const userId = req.user.id;

    const userCategories = await NewsRepository.findCategoriesByUser(userId);

    response.success(res, userCategorySerializer(userCategories));
  };

  public updateUserCategory = async (req: Request<{}, {}, UpdateUserCategoryParams>, res: Response) => {
    const userId = req.user.id;
    const { categoryIds } = req.body;
    if (categoryIds?.length) {
      const categories = await NewsRepository.getCategoryByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new NotFoundError(messages.category.notFound);
      }
    }
    await withTransaction(async (trans) => {
      await this.updateUserCategoryService(categoryIds, userId, trans);
    });
    response.success(res);
  };

  public getTotalNewReleased = async (req: Request, res: Response) => {
    const userId = req.user.id;

    const totalNewReleased = await NewsRepository.countTotalNewReleased(userId);

    response.success(res, totalNewReleased);
  };

  public readAllNewReleased = async (req: Request, res: Response) => {
    const userId = req.user.id;

    await withTransaction(async (trans) => {
      await this.readAllNewsReleased(userId, trans);
    });

    response.success(res);
  };

  public getPublicNewsList = async (req: Request<{}, {}, {}, GetPublicNews>, res: Response) => {
    const params = parseFormData(req.query, ['categoryIds']);
    const publics = await NewsRepository.getPublicNews(params);

    response.success(res, publics.map(newsSerializer));
  };

  public getPublicNewsById = async (req: Request<{}, {}, GetNewsByIdParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const news = await NewsRepository.getPublicNewsById(id);
    if (!news) throw new NotFoundError(messages.news.notFound);

    response.success(res, newsSerializer(news));
  };
}

export default new NewsController();
