import dayjs from 'dayjs';

import env from '../../config/env';
import imageStore from '../common/helpers/imageStore';
import { HealthDocumentAttributes, HealthFolderAttributes } from '../interfaces/Health';

export const healthDocumentSerialize = (doc: HealthDocumentAttributes) => ({
  id: doc.id,
  healthFolderId: doc.healthFolderId,
  babyBookId: doc.babyBookId,
  filename: doc.filename,
  fileUrl: imageStore.getUrl(doc.userId, doc.pathname),
  translatedText: doc.translatedText,
  isDeleted: doc.isDeleted,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  destroyAt: doc.isDeleted ? dayjs(doc.deletedAt).add(Number(env.healthRetentionPeriod), 'days') : null,
});

export const healthFolderSerialize = (folder: HealthFolderAttributes) => ({
  id: folder.id,
  babyBookId: folder.babyBookId,
  name: folder.name,
  totalDocument: folder.totalDocument,
  isDeleted: folder.isDeleted,
  createdAt: folder.createdAt,
  updatedAt: folder.updatedAt,
  destroyAt: folder.isDeleted ? dayjs(folder.deletedAt).add(Number(env.healthRetentionPeriod), 'days') : null,
});
