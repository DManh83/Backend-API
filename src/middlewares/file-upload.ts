import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import multer from 'multer';
import path from 'path';

import env from '../../config/env';
import { STORAGE_LIMITATION } from '../common/constants';
import BadRequestError from '../common/errors/types/BadRequestError';
import fileHelper from '../common/helpers/file';
import messages from '../common/messages';

const storage = (storageFolder: string) =>
  multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const relativePath = `${storageFolder}/${req.user.id}`;
      fileHelper.createFolderIfNotExists(relativePath);
      cb(null, `${process.cwd()}/${relativePath}`);
    },
    filename: (req, file, cb) => {
      const fileName = `${new Date().getTime()}${`${Math.random()}`.slice(-3)}${path.extname(file.originalname)}`;
      req.body.fileName = fileName;
      cb(null, fileName);
    },
  });

const multerUpload = (config: { limitSize: number; extensions: string[] }) =>
  multer({
    storage: storage(env.assetsPath),
    fileFilter: (_req, file, callback) => {
      if (!config.extensions.includes(path.extname(file.originalname).toLocaleLowerCase())) {
        return callback(new BadRequestError(messages.upload.fileAvatarExtensionNotAllow));
      }
      callback(null, true);
    },
    limits: { fileSize: config.limitSize },
  });

const fileLimitation = (req: Request, res: Response, next: NextFunction) =>
  (() => {
    let limitation = STORAGE_LIMITATION.FREE;
    const { user } = req;

    if (user.subscription?.status === 'active') {
      limitation = get(
        STORAGE_LIMITATION,
        user.subscription.record.metadata?.type.toUpperCase() ||
          user.subscription.record?.latestReceipt?.productId.split('_')[0].toUpperCase() ||
          user.subscription.record?.productId.split('_')[0].toUpperCase()
      );
    }

    if (Number(user.usedStorage) + Number(req.headers['content-length']) > limitation) {
      return next(new BadRequestError(messages.upload.uploadLimitExceeded));
    }

    return next();
  })();

export default {
  storage,
  multerUpload,
  fileLimitation,
};
