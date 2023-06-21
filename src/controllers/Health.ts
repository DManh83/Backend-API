import AdmZip from 'adm-zip';
import { Request, Response } from 'express';
import path from 'path';
import { Op } from 'sequelize';

import env from '../../config/env';
import { SharingChangeEvent } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import NoContentFound from '../common/errors/types/NoContent';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { paginationSerializer, readContentFile } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import {
  DeleteHealthDocumentParams,
  DeleteHealthFolderParams,
  ListHealthDocumentParams,
  ListHealthFolderParams,
  UpdateHealthDocumentParams,
  UploadHealthFolderParams,
} from '../interfaces/Health';
import HealthDocumentModel from '../models/HealthDocument';
import SharingChangeModel from '../models/SharingChange';
import HealthRepository from '../repositories/Health';
import { healthDocumentSerialize, healthFolderSerialize } from '../serializers/healthSerializer';
import HealthServices from '../services/Health';

import { MulterRequest } from './BabyBook';

class HealthController extends HealthServices {
  public uploadHealthDocument = async (req: Request, res: Response) => {
    const { file } = req as MulterRequest;
    const { translatedText } = req.body;

    if (!file) {
      throw new NoContentFound(messages.health.noFileUpload);
    }

    if (!translatedText) {
      req.body.translatedText = await readContentFile(file);
    }

    const documentRecord = await this.uploadDocument(req);
    response.success(res, healthDocumentSerialize(documentRecord));
  };

  public createHealthFolder = async (req: Request<{}, {}, UploadHealthFolderParams>, res: Response) => {
    const { body: folderParams, user } = req;
    let existedFolder = await HealthRepository.findFolderByName(user.id, folderParams.babyBookId, folderParams.name);

    if (existedFolder && !existedFolder.isDeleted) {
      throw new BadRequestError(messages.health.folderExists);
    }

    const duplicatedFilenames = existedFolder
      ? await HealthRepository.findDuplicatedFilename(folderParams.files, existedFolder.id)
      : await HealthRepository.findDuplicatedFilename(folderParams.files);

    if (duplicatedFilenames.length) {
      throw new BadRequestError(`Duplicated file(s): ${duplicatedFilenames.join(', ')}`);
    }
    await withTransaction(async (trans) => {
      existedFolder = existedFolder || (await this.createFolder(user, folderParams.babyBookId, folderParams.name, trans));

      await this.addDocumentsToFolder(user.id, existedFolder, folderParams.files, trans);
      if (existedFolder) {
        await this.updateFolder(existedFolder, { isDeleted: false, deletedAt: null }, trans);
      }
    });

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: existedFolder.babyBookId,
        event: SharingChangeEvent.CREATE_HEALTH_FOLDER,
        to: {
          folderName: existedFolder.name,
        },
      });
    }

    response.success(res, healthFolderSerialize(existedFolder));
  };

  public updateHealthFolder = async (req: Request<{}, {}, UploadHealthFolderParams>, res: Response) => {
    const { body: folderParams, user } = req;
    const { id: folderId } = req.params as { id: string };

    const existedFolder = await HealthRepository.findFolderById(folderId);

    if (!existedFolder) {
      throw new NotFoundError(messages.health.folderNotFound);
    }

    if (folderParams?.name) {
      const nameDuplicatedFolder = await HealthRepository.findFolderByName(user.id, existedFolder.babyBookId, folderParams.name);

      if (nameDuplicatedFolder) {
        throw new BadRequestError(messages.health.folderNameExists);
      }
    }

    if (folderParams?.files) {
      const duplicatedFilenames = await HealthRepository.findDuplicatedFilename(folderParams.files, folderId);

      if (duplicatedFilenames.length) {
        throw new BadRequestError(`Duplicated file(s): ${duplicatedFilenames.join(', ')}`);
      }
    }

    await withTransaction(async (trans) => {
      if (folderParams?.name) {
        const newFolder = { name: folderParams.name };
        if (user.requestBy) {
          SharingChangeModel.create({
            userId: user.id,
            email: user.requestBy,
            babyBookId: existedFolder.babyBookId,
            event: SharingChangeEvent.UPDATE_HEALTH_FOLDER,
            from: {
              folderName: existedFolder.name,
            },
            to: {
              folderName: folderParams.name,
            },
          });
        }
        await this.updateFolder(existedFolder, newFolder, trans);
      }
      if (folderParams.files) {
        await this.addDocumentsToFolder(user.id, existedFolder, folderParams.files, trans);
        existedFolder.totalDocument += folderParams.files.length;
        if (user.requestBy) {
          SharingChangeModel.create({
            userId: user.id,
            email: user.requestBy,
            babyBookId: existedFolder.babyBookId,
            event: SharingChangeEvent.UPDATE_HEALTH_FOLDER,
            to: {
              total: folderParams.files.length,
              folderName: existedFolder.name,
            },
          });
        }
      }
    });

    response.success(res, healthFolderSerialize(existedFolder));
  };

  public updateHealthDocument = async (req: Request<{}, {}, UpdateHealthDocumentParams>, res: Response) => {
    const { body: updateParams, user } = req;
    const { id } = req.params as { id: string };

    const existedDocument = await HealthRepository.findDocumentById(id, user.id);
    if (!existedDocument) {
      throw new NotFoundError(messages.health.documentNotFound);
    }

    const duplicatedNameDocument = await HealthRepository.findDocumentByName(
      user.id,
      existedDocument.healthFolderId,
      updateParams.filename
    );

    if (duplicatedNameDocument) throw new BadRequestError(messages.health.documentNameExists);

    if (path.extname(existedDocument.filename) !== path.extname(updateParams.filename)) {
      throw new BadRequestError(messages.health.extensionConflict);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedDocument.babyBookId,
          event: SharingChangeEvent.UPDATE_HEALTH_DOCUMENT,
          from: {
            documentName: existedDocument.filename,
          },
          to: {
            documentName: updateParams.filename,
            folderName: existedDocument.documentFolder?.name,
          },
        });
      }
      await this.updateDocument(existedDocument, updateParams, trans);
    });

    response.success(res, healthDocumentSerialize(existedDocument));
  };

  public getListHealthFolder = async (req: Request<{}, {}, {}, ListHealthFolderParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);
    const { session, user } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const dataResponse: any = {};

    if (listParams.isGetAll && listParams.babyBookId) {
      const folders = await HealthRepository.findAllFolder(listParams.babyBookId);
      dataResponse.folders = folders.map(healthFolderSerialize);
    } else {
      const documents = await HealthRepository.findAllDocumentByNameAndContent({
        userId: user?.id || session?.userId,
        paginationParams: listParams,
      });

      const serializeDoc = documents.map((item) => ({
        folder: healthFolderSerialize(item.documentFolder),
        file: healthDocumentSerialize(item),
      }));

      const result = Array.from(new Set(serializeDoc.map((item) => item.folder.id))).map((folderId) => ({
        ...serializeDoc.find((item) => item.folder.id === folderId).folder,
        files: serializeDoc.filter((item) => item.folder.id === folderId).map((fileItem) => fileItem.file),
      }));

      dataResponse.folders = result;
    }
    response.success(res, dataResponse.folders);
  };

  public getSingleHealthFolder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      session,
      query: { babyBookId },
    } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }
    const existedFolder = await HealthRepository.findFolderById(id);

    if (!existedFolder) {
      throw new NotFoundError(messages.health.folderNotFound);
    }

    response.success(res, healthFolderSerialize(existedFolder));
  };

  public getListHealthDocument = async (req: Request<{}, {}, {}, ListHealthDocumentParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);
    const { session } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const documents = await HealthRepository.findDocumentWithPagination({
      userId: req.user?.id || session?.userId,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(documents, healthDocumentSerialize));
  };

  public deleteHealthDocument = async (req: Request<{}, {}, {}, DeleteHealthDocumentParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const ids = id.split(',');
    const { user } = req;

    const deleteParams: DeleteHealthDocumentParams = parseFormData(req.query, ['force']);

    const docs = await HealthDocumentModel.findAll({ where: { id: { [Op.in]: ids }, userId: user.id } });
    if (docs.length !== ids.length) {
      throw new NotFoundError(messages.health.documentNotFound);
    }

    if (user.requestBy) {
      const folder = await HealthRepository.findFolderById(docs[0].healthFolderId, deleteParams.force);

      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: folder.babyBookId,
        event: SharingChangeEvent.DELETE_HEALTH_DOCUMENT,
        to: {
          total: ids.length,
          folderName: folder.name,
        },
      });
    }

    await this.deleteDocument(req.user.id, docs, deleteParams.force);

    response.success(res);
  };

  public deleteHealthFolder = async (req: Request<{}, {}, {}, DeleteHealthFolderParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;
    const deleteParams: DeleteHealthFolderParams = parseFormData(req.query, ['force']);

    const folder = await HealthRepository.findFolderById(id);
    if (!folder || folder.isDeleted) {
      throw new NotFoundError(messages.health.folderNotFound);
    }

    await this.deleteFolder(user.id, folder, deleteParams.force);

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: folder.babyBookId,
        event: SharingChangeEvent.DELETE_HEALTH_FOLDER,
        to: {
          folderName: folder.name,
        },
      });
    }

    response.success(res);
  };

  public undoHealthDocument = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const ids = id.split(',');

    const documents = await HealthDocumentModel.findAll({ where: { id: { [Op.in]: ids }, userId: req.user.id } });

    if (documents.length !== ids.length) {
      throw new NotFoundError(messages.health.documentNotFound);
    }

    await HealthDocumentModel.update({ isDeleted: false }, { where: { id: { [Op.in]: ids } } });

    documents.forEach((doc) => {
      doc.isDeleted = false;
    });

    response.success(res, documents.map(healthDocumentSerialize));
  };

  // only mobile
  public downloadHealthFolder = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;
    const documents = await HealthDocumentModel.findAll({ where: { healthFolderId: id, userId: user.id } });
    const zip = new AdmZip();
    documents.forEach((document) => {
      const filePath = `${env.assetsPath}/${user.id}/${document.pathname}`;
      zip.addLocalFile(filePath, '', `${document.filename}`);
    });

    return res.send(zip.toBuffer());
  };
}

export default new HealthController();
