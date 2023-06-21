import { PaginationParams } from '../common/helpers/pagination/types';

export interface NewsAttributes {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverPicture: string;
  content: string;
  isPublished: boolean;
  isDeleted: boolean;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  publishAt?: Date;
  newsCategory?: NewsCategoryAttributes[];
}

export type NewsCreation = Omit<NewsAttributes, 'id'>;

export interface CreateNewsParams {
  title: string;
  author: string;
  coverPicture: string;
  categoryIds: string[];
  content: string;
  isPublished: boolean;
  isPublic: boolean;
}

export interface GetNewsListParams extends PaginationParams {
  userId?: string;
  isDeleted?: boolean;
  isPublished?: boolean;
  showAll?: boolean;
}

export interface GetNewsByIdParams {
  id: string;
}

export interface UpdateNewsParams {
  isPublic: boolean;
  title?: string;
  author?: string;
  content?: string;
  coverPicture?: string;
  isPublished?: boolean;
  categoryIds?: string[];
}

export interface CategoryAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryCreation = Omit<CategoryAttributes, 'id'>;

export interface CreateCategoryParams {
  name: string;
}

export interface UpdateCategoryParams {
  name?: string;
}

export interface NewsCategoryAttributes {
  id: string;
  newsId: string;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
  category?: CategoryAttributes;
}

export type NewsCategoryCreation = Omit<NewsCategoryAttributes, 'id'>;

export interface UserCategoryAttributes {
  id: string;
  userId: string;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
  category?: CategoryAttributes;
}

export type UserCategoryCreation = Omit<NewsCategoryAttributes, 'id'>;

export interface UpdateUserCategoryParams {
  categoryIds?: string[];
}

export interface NewsReleasedAttributes {
  id: string;
  newsId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewsReleasedCreation = Omit<NewsReleasedAttributes, 'id'>;

export interface GetPublicNews {
  page?: number;
  pageSize?: number;
  categoryIds?: string[];
  searchValue?: string;
  except?: string;
}
