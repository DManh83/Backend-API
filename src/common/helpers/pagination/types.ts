import { Model, FindOptions } from 'sequelize';

export type OrderDirection = 'DESC' | 'ASC';

export type FieldOrderConfig = [string, OrderDirection];

export type OrderConfig = FieldOrderConfig[];

export type CursorPayload = any[];

export interface PaginationEdge<Item = any> {
  cursor: string;
  item: Item;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginationConnection<Item = any> {
  totalCount: number;
  list: PaginationEdge<Item>[];
  pageInfo: PageInfo;
}

export interface withPaginateOptions {
  primaryKeyField?: string | string[];
  omitPrimaryKeyFromOrder?: boolean;
}

export interface PaginateOptions<ModelType extends Model> extends FindOptions<ModelType['_attributes']> {
  after?: string;
  before?: string;
}

export interface PaginationParams {
  limit?: number;
  searchValue?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  after?: string;
  before?: string;
  order?: OrderConfig;
}

export type PaginationQuery = Omit<PaginationParams, 'searchValue' | 'sortBy' | 'sortDirection'> & { order?: OrderConfig };
