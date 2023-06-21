import { isNil, omitBy } from 'lodash';
import { col, fn, Op, where, WhereOptions } from 'sequelize';

import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import { GetNoteListParams, GetTagListParams, NoteAttributes, TagAttributes } from '../interfaces/Note';
import NoteModel from '../models/Note';
import NoteTagModel from '../models/NoteTag';
import TagModel from '../models/Tag';

class NoteRepository {
  getNoteById = (id: string) =>
    NoteModel.findOne({
      where: { id },
    });

  getNoteByIds = (ids: string[], userId?: string) => {
    const otherCond = {
      userId,
    };
    return NoteModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        ...omitBy(otherCond, isNil),
      },
    });
  };

  getTagByIds = (ids: string[], userId?: string) => {
    const otherCond = {
      userId,
    };
    return TagModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        ...omitBy(otherCond, isNil),
      },
    });
  };

  findNotesWithPagination = ({ userId, paginationParams }: { userId: string; paginationParams: GetNoteListParams }) => {
    const noteCond: WhereOptions<NoteAttributes> = {
      userId,
      babyBookId: paginationParams.babyBookId,
      isDeleted: paginationParams.isDeleted || false,
    };

    paginationParams.order = [
      [paginationParams.sortBy, paginationParams.sortDirection],
      ['updated_at', 'DESC'],
    ];

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      noteCond[Op.or] = {
        title: { [Op.iLike]: `%${paginationParams.searchValue}%` },
        rawContent: { [Op.iLike]: `%${paginationParams.searchValue}%` },
      };
    }

    return withPaginate<NoteModel>(NoteModel)({
      ...paginateOptions,
      where: { ...noteCond },
      include: [
        {
          model: NoteTagModel,
          as: 'note_tag',
          required: false,
          include: [
            {
              model: TagModel,
              as: 'tag',
              required: false,
            },
          ],
        },
      ],
    });
  };

  findTagByName = async (name: string, userId: string) =>
    TagModel.findOne({
      where: {
        userId: {
          [Op.or]: [null, userId],
        },
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });

  findNoteBySearchValue = async (babyBookIds: string[], value: string) =>
    NoteModel.findAll({
      where: {
        babyBookId: {
          [Op.in]: [...babyBookIds],
        },
        [Op.or]: {
          title: { [Op.iLike]: `%${value}%` },
          rawContent: { [Op.iLike]: `%${value}%` },
        },
        isDeleted: false,
      },
    });

  getTagById = (id: string) =>
    TagModel.findOne({
      where: { id },
    });

  findTagsWithPagination = ({ userId, paginationParams }: { userId: string; paginationParams: GetTagListParams }) => {
    const tagCond: WhereOptions<TagAttributes> = {
      userId: {
        [Op.or]: [null, userId],
      },
      isDeleted: paginationParams.isDeleted || false,
    };

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      tagCond.name = { [Op.iLike]: `%${paginationParams.searchValue}%` };
    }

    return withPaginate<TagModel>(TagModel)({
      ...paginateOptions,
      where: { ...tagCond },
    });
  };
}

export default new NoteRepository();
