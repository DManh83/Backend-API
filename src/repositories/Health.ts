import { uniq } from 'lodash';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import { getPaginateOptions } from '../common/helpers/pagination/utils';
import withPaginate from '../common/helpers/pagination/withPaginate';
import {
  HealthDocumentAttributes,
  HealthFolderAttributes,
  ListHealthDocumentParams,
  ListHealthFolderParams,
  HealthDocumentCreation,
} from '../interfaces/Health';

import HealthDocumentModel from '../models/HealthDocument';
import HealthFolderModel from '../models/HealthFolder';

class HealthRepository {
  async getDocuments(healthFolderId: string) {
    return HealthDocumentModel.findAll({
      where: {
        healthFolderId,
      },
    });
  }

  async findFolderByName(userId: string, babyBookId: string, name: string) {
    return HealthFolderModel.findOne({
      where: {
        userId,
        babyBookId,
        name: where(fn('LOWER', col('name')), 'LIKE', name.trim().toLowerCase()),
      },
    });
  }

  async findDocumentByName(userId: string, healthFolderId: string, filename: string) {
    return HealthDocumentModel.findOne({
      where: {
        userId,
        healthFolderId,
        filename: where(fn('LOWER', col('filename')), 'LIKE', filename.trim().toLowerCase()),
      },
    });
  }

  async findDuplicatedFilename(fileIds: string[], healthFolderId?: string) {
    const duplicatedNames = [];

    const validatingFiles = await HealthDocumentModel.findAll({
      where: {
        id: {
          [Op.in]: fileIds,
        },
      },
    });
    const validNames: string[] = [];

    validatingFiles.forEach((file) => {
      if (validNames.includes(file.filename)) {
        duplicatedNames.push(file.filename);
      } else {
        validNames.push(file.filename.trim().toLowerCase());
      }
    });

    if (duplicatedNames.length || !healthFolderId) return duplicatedNames;

    const duplicatedFiles = await HealthDocumentModel.findAll({
      where: {
        healthFolderId,
        filename: where(fn('LOWER', col('filename')), {
          [Op.in]: validNames,
        }),
      },
    });

    return uniq(duplicatedFiles.map((file) => file.filename));
  }

  async findAllFolder(babyBookId: string) {
    return HealthFolderModel.findAll({
      where: {
        babyBookId,
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findFolderById(id: string, force?: boolean) {
    return HealthFolderModel.findOne({
      where: {
        id,
        isDeleted: force || false,
      },
    });
  }

  async findAllDocumentByNameAndContent({ userId, paginationParams }: { userId: string; paginationParams: ListHealthFolderParams }) {
    return HealthDocumentModel.findAll({
      where: {
        userId,
        babyBookId: paginationParams.babyBookId,
        isDeleted: paginationParams.isDeleted || false,
        [Op.or]: {
          filename: { [Op.iLike]: `%${paginationParams.searchValue}%` },
          translatedText: { [Op.iLike]: `%${paginationParams.searchValue}%` },
        },
      },
      include: [
        {
          model: HealthFolderModel,
          as: 'documentFolder',
          required: false,
        },
      ],
    });
  }

  async findDocumentById(id: string, userId: string) {
    return HealthDocumentModel.findOne({
      where: {
        id,
        userId,
      },
      include: [
        {
          model: HealthFolderModel,
          as: 'documentFolder',
        },
      ],
    });
  }

  async findFolderWithPagination({ userId, paginationParams }: { userId: string; paginationParams: ListHealthFolderParams }) {
    const folderCond: WhereOptions<HealthFolderAttributes> = {
      userId,
      babyBookId: paginationParams.babyBookId,
      isDeleted: paginationParams.isDeleted || false,
    };

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      folderCond.name = { [Op.iLike]: `%${paginationParams.searchValue}%` };
    }

    return withPaginate<HealthFolderModel>(HealthFolderModel)({
      ...paginateOptions,
      where: { ...folderCond },
    });
  }

  async findDocumentWithPagination({ userId, paginationParams }: { userId: string; paginationParams: ListHealthDocumentParams }) {
    const documentCond: WhereOptions<HealthDocumentAttributes> = {
      userId,
      isDeleted: paginationParams.isDeleted || false,
    };

    if (paginationParams.babyBookId) {
      documentCond.babyBookId = paginationParams.babyBookId;
    }
    if (paginationParams.folderId) {
      documentCond.healthFolderId = paginationParams.folderId;
    }

    const paginateOptions = getPaginateOptions(paginationParams);

    if (paginationParams.searchValue) {
      documentCond[Op.or] = {
        filename: { [Op.iLike]: `%${paginationParams.searchValue}%` },
        translatedText: { [Op.iLike]: `%${paginationParams.searchValue}%` },
      };
    }

    return withPaginate<HealthDocumentModel>(HealthDocumentModel)({
      ...paginateOptions,
      where: documentCond,
    });
  }

  findFoldersByValue = (babyBookIds: string[], value: string) =>
    HealthFolderModel.findAll({
      where: {
        babyBookId: {
          [Op.in]: [...babyBookIds],
        },
        isDeleted: false,
        name: {
          [Op.iLike]: `%${value}%`,
        },
      },
    });

  findDocumentsByValue = (babyBookIds: string[], value: string, byContent?: boolean) => {
    const searchCond: WhereOptions<HealthDocumentAttributes | HealthDocumentCreation> = {
      babyBookId: {
        [Op.in]: [...babyBookIds],
      },
      isDeleted: false,
    };
    if (byContent) {
      searchCond.translatedText = { [Op.iLike]: `%${value}%` };
    } else {
      searchCond.filename = { [Op.iLike]: `%${value}%` };
    }

    return HealthDocumentModel.findAll({
      where: searchCond,
      include: [
        {
          model: HealthFolderModel,
          as: 'documentFolder',
        },
      ],
    });
  };
}

export default new HealthRepository();
