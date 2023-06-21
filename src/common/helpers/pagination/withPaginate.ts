import { Op, Model, WhereOptions } from 'sequelize';

import { parseCursor, createCursor, normalizeOrder, getPaginationQuery, reverseOrder, getPrimaryKeyFields } from './utils';

import { withPaginateOptions, PaginateOptions, PaginationConnection } from './types';

const withPaginate = <ModelType extends Model>(model, options?: withPaginateOptions) => {
  const primaryKeyField = options?.primaryKeyField ?? getPrimaryKeyFields(model);

  const omitPrimaryKeyFromOrder = options?.omitPrimaryKeyFromOrder ?? false;

  const paginate = async (queryOptions: PaginateOptions<ModelType>): Promise<PaginationConnection<ModelType>> => {
    const { order: orderOption, where, after, before, limit, ...restQueryOptions } = queryOptions;

    const normalizedOrder = normalizeOrder(orderOption, primaryKeyField, omitPrimaryKeyFromOrder);

    const order = before ? reverseOrder(normalizedOrder) : normalizedOrder;

    const cursor = after ? parseCursor(after) : before ? parseCursor(before) : null;

    const paginationQuery = cursor ? getPaginationQuery(order, cursor) : null;

    const paginationWhere: WhereOptions | undefined = paginationQuery ? { [Op.and]: [paginationQuery, where] } : where;

    const paginationQueryOptions = {
      where: paginationWhere,
      limit,
      order,
      ...restQueryOptions,
    };

    const totalCountQueryOptions = {
      where,
      ...restQueryOptions,
    };

    const cursorCountQueryOptions = {
      where: paginationWhere,
      ...restQueryOptions,
    };

    const [instances, totalCount, cursorCount] = await Promise.all([
      model.findAll(paginationQueryOptions),
      model.count(totalCountQueryOptions),
      model.count(cursorCountQueryOptions),
    ]);

    if (before) {
      instances.reverse();
    }

    const remaining = cursorCount - instances.length;

    const hasNextPage = (!before && remaining > 0) || (Boolean(before) && totalCount - cursorCount > 0);

    const hasPreviousPage = (Boolean(before) && remaining > 0) || (!before && totalCount - cursorCount > 0);

    const list = instances.map((item) => ({
      item,
      cursor: createCursor(item, order),
    }));

    const pageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: list.length > 0 ? list[0].cursor : null,
      endCursor: list.length > 0 ? list[list.length - 1].cursor : null,
    };

    return {
      totalCount,
      list,
      pageInfo,
    };
  };

  return paginate;
};

export default withPaginate;
