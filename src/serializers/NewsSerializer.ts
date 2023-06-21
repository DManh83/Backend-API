import imageStore from '../common/helpers/imageStore';
import { CategoryAttributes, NewsAttributes } from '../interfaces/News';
import UserCategoryModel from '../models/UserCategory';

export const newsSerializer = (news: NewsAttributes) => ({
  id: news.id,
  title: news.title,
  userId: news.userId,
  author: news.author,
  content: news.content,
  coverPicture: imageStore.getPath(news.coverPicture),
  isPublished: news.isPublished,
  isPublic: news.isPublic,
  isDeleted: news.isDeleted,
  deletedAt: news.deletedAt,
  createdAt: news.createdAt,
  updatedAt: news.updatedAt,
  publishAt: news.publishAt,
  categories: news.newsCategory?.map((cate) => categorySerializer(cate.category)),
});

export const categorySerializer = (category: CategoryAttributes) => ({
  id: category.id,
  category: category.name,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const userCategorySerializer = (userCategory: UserCategoryModel[]) => ({
  categories: userCategory.map((cate) => categorySerializer(cate.category)),
});
