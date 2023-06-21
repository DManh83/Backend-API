import dayjs from 'dayjs';
import { Request } from 'express';
import { has, isEmpty } from 'lodash';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize/types';

import imageStore from '../common/helpers/imageStore';
import { MulterRequest } from '../controllers/BabyBook';
import { HealthDocumentCreation, HealthFolderCreation } from '../interfaces/Health';
import HealthDocumentModel from '../models/HealthDocument';
import HealthFolderModel from '../models/HealthFolder';

class HealthServices {
  public uploadDocument = async (req: Request) => {
    const { file, user } = req as MulterRequest;
    const { translatedText } = req.body;

    const documentShape: HealthDocumentCreation = {
      userId: user.id,
      filename: file.originalname,
      pathname: file.filename,
      isDeleted: true,
      translatedText,
      deletedAt: new Date(dayjs().valueOf()),
      fileSize: file.size,
    };

    return HealthDocumentModel.create(documentShape);
  };

  public createFolder = async (user: { id: string }, babyBookId: string, name: string, transaction: Transaction) => {
    const folderShape = {
      userId: user.id,
      babyBookId,
      name,
      totalDocument: 0,
      isDeleted: false,
      deletedAt: null,
    };

    const newFolder = await HealthFolderModel.create(folderShape, { transaction });

    return newFolder;
  };

  public addDocumentsToFolder = async (userId: string, folder: HealthFolderModel, docIds: string[], transaction: Transaction) => {
    const documents = await HealthDocumentModel.findAll({
      where: {
        id: { [Op.in]: docIds },
        userId,
      },
    });

    const updatedDocs: HealthDocumentCreation[] = documents.map((doc) => ({
      id: doc.id,
      userId,
      healthFolderId: folder.id,
      babyBookId: folder.babyBookId,
      filename: doc.filename,
      pathname: doc.pathname,
      isDeleted: false,
      fileSize: doc.fileSize,
    }));

    await HealthDocumentModel.bulkCreate(updatedDocs, { updateOnDuplicate: ['healthFolderId', 'babyBookId', 'isDeleted'], transaction });
  };

  public updateFolder = async (folder: HealthFolderModel, newData: Partial<HealthFolderCreation>, transaction: Transaction) => {
    if (isEmpty(newData)) return;

    if (has(newData, 'name') && newData.name !== folder.name) {
      folder.name = newData.name;
    }

    if (has(newData, 'isDeleted')) {
      folder.isDeleted = newData.isDeleted;
      folder.deletedAt = newData.deletedAt || null;
    }

    await folder.save({ transaction });
  };

  public updateDocument = async (document: HealthDocumentModel, newData: Partial<HealthDocumentCreation>, transaction: Transaction) => {
    if (isEmpty(newData)) return;

    if (newData.filename) {
      document.filename = newData.filename;
    }

    await document.save({ transaction });
  };

  public deleteDocument = async (userId: string, docs: HealthDocumentModel[], force?: boolean) =>
    Promise.all(
      docs.map(async (document) => {
        if (force) {
          await imageStore.deleteFile(userId, document.pathname);
          return document.destroy();
        }

        document.isDeleted = true;
        return document.save();
      })
    );

  public deleteFolder = async (userId: string, folder: HealthFolderModel, force?: boolean) => {
    if (force) {
      return folder.destroy();
    }

    folder.isDeleted = true;
    await HealthDocumentModel.update({ isDeleted: true }, { where: { healthFolderId: folder.id, userId } });
    return folder.save();
  };
}

export default HealthServices;
