import { Request, Response } from 'express';
import { get, has } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { SharingChangeEvent, UserRole } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NoContentFound from '../common/errors/types/NoContent';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { paginationSerializer, readContentFile } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import {
  AddSuggestedVersionParams,
  ChangeCheckUpVersionParams,
  CreateCheckUpParams,
  CreateSuggestedCheckUpParams,
  DeleteCheckUpFileParams,
  GetCheckUpVersionListParams,
  GetListCheckUpFilesParams,
  GetListCheckUpParams,
  GetSelectedCheckUpVersionParams,
  UndoCheckUpFileParams,
  UpdateCheckUpScheduleParams,
  UpdateSuggestedCheckUpParams,
  UpdateVersionParams,
} from '../interfaces/CheckUp';
import BabyBookModel from '../models/BabyBook';
import HealthDocumentModel from '../models/HealthDocument';
import SharingChangeModel from '../models/SharingChange';
import CheckUpRepository from '../repositories/CheckUp';
import HealthRepository from '../repositories/Health';
import {
  checkUpFileSerializer,
  checkUpSerializer,
  checkUpVersionSerializer,
  userCheckUpVersionSerializer,
} from '../serializers/checkUpSerializer';
import CheckUpServices from '../services/CheckUp';

import { MulterRequest } from './BabyBook';

class CheckUpController extends CheckUpServices {
  public uploadCheckUpFile = async (req: Request, res: Response) => {
    const { file } = req as MulterRequest;
    if (!file) {
      throw new NoContentFound(messages.checkUp.noFileFound);
    }

    if (!req.body.translatedText) {
      req.body.translatedText = await readContentFile(file);
    }
    const fileRecord = await this.uploadFile(req);
    response.success(res, checkUpFileSerializer(fileRecord));
  };

  public createNewCheckUp = async (req: Request<{}, {}, CreateCheckUpParams>, res: Response) => {
    const { body: params, user } = req;

    const existedVersion = await CheckUpRepository.getVersionById(params.checkUpVersionId);

    if (!existedVersion) {
      throw new NotFoundError(messages.checkUp.versionNotFound);
    }

    const duplicatedFilenames = await CheckUpRepository.findDuplicatedFilename(params.files);

    if (duplicatedFilenames.length) {
      throw new BadRequestError(`Duplicated file(s): ${duplicatedFilenames.join(', ')}`);
    }

    await withTransaction(async (trans) => {
      const checkUp = await this.createCheckUp(
        {
          userId: !existedVersion.isSuggested ? user.id : null,
          checkUpVersionId: existedVersion.id,
          isSuggested: existedVersion.isSuggested,
          title: params.title,
          ageDue: existedVersion.isSuggested ? params.ageDue : null,
          monthDue: existedVersion.isSuggested ? params.monthDue : null,
        },
        trans
      );

      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: params.babyBookId,
          event: SharingChangeEvent.CREATE_CHECK_UP_RECORD,
          to: {
            title: checkUp.title || '',
            ageDue: checkUp.ageDue || '',
            isSuggested: checkUp.isSuggested,
          },
        });
      }

      if (!existedVersion.isSuggested) {
        const existedSchedule = await this.createScheduledCheckUp(
          {
            userId: user.id,
            babyBookId: params.babyBookId,
            checkUpVersionId: existedVersion.id,
            checkUpId: checkUp.id,
            status: params.status || null,
            isSuggested: existedVersion.isSuggested,
            dateDue: params.dateDue,
            notifyAt: params.notifyAt || null,
          },
          trans
        );

        if (params.files.length) {
          const files = await this.addFilesToFolder(user.id, existedSchedule, params.files, trans);

          let duplicatedFiles: HealthDocumentModel[] = [];
          if (files.length) {
            const checkUpFolder = await HealthRepository.findFolderByName(user.id, files[0].babyBookId, 'Check-up');
            if (checkUpFolder) {
              const fileNames = files.map((file) => file.filename.toLowerCase());
              duplicatedFiles = await CheckUpRepository.findDuplicatedFileNameInHealthFolder(fileNames, checkUpFolder.id);
            }

            await withTransaction(async (trans) => {
              const duplicatedFileNames = duplicatedFiles.map((file) => file.filename);
              const validFiles = files.filter((file) => !duplicatedFileNames.includes(file.filename));
              await this.addFilesToHealthFolder(validFiles, trans, checkUpFolder);
            });
            response.success(res, duplicatedFiles);
          }
        }
      }
    });

    response.success(res);
  };

  getVersionList = async (req: Request<{}, {}, {}, GetCheckUpVersionListParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isSuggested', 'isReleased']);
    const versions = await CheckUpRepository.findVersionWithPagination({
      userId: req.query.userId || get(req.user, 'id'),
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(versions, checkUpVersionSerializer));
  };

  getAllVersion = async (req: Request, res: Response) => {
    const versions = await CheckUpRepository.findAllVersionWithCheckUps();

    response.success(res, versions);
  };

  getListCheckUp = async (req: Request<{}, {}, {}, GetListCheckUpParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['page', 'pageSize', 'order']) as GetListCheckUpParams;
    const { session, user } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const { count, rows } = await CheckUpRepository.findCheckUpWithPagination(user?.id || session?.userId, listParams);

    response.success(res, {
      page: listParams.page,
      list: rows.map(checkUpSerializer),
      totalCheckUps: count,
    });
  };

  getCheckUpFiles = async (req: Request<{}, {}, {}, GetListCheckUpFilesParams>, res: Response) => {
    const listParams = parseFormData(req.query, ['isDeleted']);

    const { session, user } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === listParams.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const documents = await CheckUpRepository.findCheckUpFileWithPagination({
      userId: user?.id || session?.userId,
      paginationParams: listParams,
    });

    response.success(res, paginationSerializer(documents, checkUpFileSerializer));
  };

  deleteCheckUpFiles = async (req: Request<{}, {}, {}, DeleteCheckUpFileParams>, res: Response) => {
    const deleteParams: DeleteCheckUpFileParams = parseFormData(req.query, ['force', 'ids']);
    const { user } = req;

    const files = await CheckUpRepository.getCheckUpFileByIds(deleteParams.ids, req.user.id);

    if (!files.length || files.length !== deleteParams.ids.length) {
      throw new NotFoundError(messages.checkUp.noFileFound);
    }

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        const checkUpSchedule = await CheckUpRepository.getScheduleById(files[0].checkUpScheduleId, true);

        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: files[0].babyBookId,
          event: SharingChangeEvent.DELETE_CHECK_UP_FILE,
          to: {
            total: files.length,
            filename: files.map((f) => f.filename).join(', '),
            title: checkUpSchedule.checkUp?.title || '',
            ageDue: checkUpSchedule.checkUp?.ageDue || '',
            isSuggested: checkUpSchedule.isSuggested,
          },
        });
      }

      await this.deleteCheckUpFileService(files, deleteParams.force || false, trans);
    });

    response.success(res);
  };

  undoCheckUpFiles = async (req: Request<{}, {}, UndoCheckUpFileParams>, res: Response) => {
    const undoParams = req.body;
    const files = await CheckUpRepository.getCheckUpFileByIds(undoParams.ids, req.user.id);

    if (files.length !== undoParams.ids.length) {
      throw new NotFoundError(messages.checkUp.noFileFound);
    }

    await withTransaction(async (trans) => {
      await this.undoCheckUpFilesService(undoParams.ids, trans);
    });

    response.success(res);
  };

  getSelectedVersion = async (req: Request<{}, {}, {}, GetSelectedCheckUpVersionParams>, res: Response) => {
    const { user, session, query: params } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === params.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
    if (!existedBabyBook) throw new NotFoundError(messages.babyBook.notFound);

    const userVersions = await CheckUpRepository.findSelectedVersion(user?.id || session?.userId, params.babyBookId);

    const versions = userVersions.map(userCheckUpVersionSerializer);

    if (user) {
      await withTransaction(async (trans) => {
        if (!versions.find((v) => v.checkUpVersion.isSuggested)) {
          const defaultVersion = await CheckUpRepository.findVersionByCountryCode(user.countryCode);

          if (defaultVersion.length === 1 && defaultVersion[0]) {
            const newUserCheckUpVersion = await this.createUserVersionRelation(user.id, params.babyBookId, defaultVersion[0].id, trans);

            await this.createCheckUpScheduleInSuggestedVersion(defaultVersion[0], existedBabyBook, user.id, trans);
            versions.push({
              id: newUserCheckUpVersion.id,
              checkUpVersionId: defaultVersion[0].id,
              checkUpVersion: defaultVersion[0],
            });
          }
        }

        if (!versions.find((v) => !v.checkUpVersion.isSuggested)) {
          // Add custom check up version to babyBook
          const customVersion = await this.createVersion(
            {
              userId: user.id,
              babyBookId: params.babyBookId,
              isSuggested: false,
            },
            trans
          );

          const customUserVersion = await this.createUserVersionRelation(user.id, params.babyBookId, customVersion.id, trans);

          versions.push({
            id: customUserVersion.id,
            checkUpVersionId: customVersion.id,
            checkUpVersion: customVersion,
          });
        }
      });
    }

    response.success(res, versions);
  };

  updateCheckUpScheduleRecord = async (req: Request<{}, {}, UpdateCheckUpScheduleParams>, res: Response) => {
    const { body: params, user } = req;
    const { id } = req.params as { id: string };

    const existedSchedule = await CheckUpRepository.getScheduleById(id);
    if (!existedSchedule) throw new NotFoundError(messages.checkUp.scheduleNotFound);

    const existedCheckUp = await CheckUpRepository.getCheckUpById(existedSchedule.checkUpId);
    if (!existedCheckUp) throw new NotFoundError(messages.checkUp.notFound);

    if (params?.files) {
      const duplicatedFilenames = await CheckUpRepository.findDuplicatedFilename(params.files, existedSchedule.id);

      if (duplicatedFilenames.length) {
        throw new BadRequestError(`Duplicated file(s): ${duplicatedFilenames.join(', ')}`);
      }
    }
    let files = [];
    const changes: SharingChangeAttributes[] = [];
    await withTransaction(async (trans) => {
      if (user.requestBy && params.title && params.title !== existedCheckUp.title) {
        changes.push({
          id: uuidv4(),
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedSchedule.babyBookId,
          event: SharingChangeEvent.UPDATE_CHECK_UP_RECORD,
          from: {
            title: existedCheckUp.title || '',
            isSuggested: existedCheckUp.isSuggested,
          },
          to: {
            title: params.title,
          },
        });
      }
      await this.updateCheckUp(existedCheckUp, params, trans);
      await this.updateCheckUpSchedule(existedSchedule, existedCheckUp, params, user, trans);
      if (has(params, 'files')) {
        files = await this.addFilesToFolder(user.id, existedSchedule, params.files, trans);
        if (user.requestBy && files.length) {
          changes.push({
            id: uuidv4(),
            userId: user.id,
            email: user.requestBy,
            babyBookId: existedSchedule.babyBookId,
            event: SharingChangeEvent.UPDATE_CHECK_UP_RECORD,
            to: {
              total: files.length,
              filename: files.map((f) => f.filename).join(', '),
              title: existedCheckUp.title || '',
              ageDue: existedCheckUp.ageDue || '',
              isSuggested: existedCheckUp.isSuggested,
            },
          });
        }
      }
    });

    let duplicatedFiles: HealthDocumentModel[] = [];
    if (has(params, 'files') && files.length) {
      const checkUpFolder = await HealthRepository.findFolderByName(user.id, files[0].babyBookId, 'Check-up');
      if (checkUpFolder) {
        const fileNames = files.map((file) => file.filename.toLowerCase());
        duplicatedFiles = await CheckUpRepository.findDuplicatedFileNameInHealthFolder(fileNames, checkUpFolder.id);
      }

      await withTransaction(async (trans) => {
        const duplicatedFileNames = duplicatedFiles.map((file) => file.filename);
        const validFiles = files.filter((file) => !duplicatedFileNames.includes(file.filename));
        await this.addFilesToHealthFolder(validFiles, trans, checkUpFolder);
      });
    }

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }
    response.success(res, duplicatedFiles);
  };

  deleteCheckUp = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;

    const existedCheckUp = await CheckUpRepository.getCheckUpById(id, true);
    if (!existedCheckUp) throw new NotFoundError(messages.checkUp.notFound);

    await withTransaction(async (trans) => {
      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: (existedCheckUp.schedule && existedCheckUp.schedule[0]?.babyBookId) || null,
          event: SharingChangeEvent.DELETE_CHECK_UP_RECORD,
          to: {
            title: existedCheckUp.title,
            ageDue: existedCheckUp.ageDue || '',
            isSuggested: existedCheckUp.isSuggested,
          },
        });
      }
      await this.destroyCheckUp(existedCheckUp.id, trans);
    });

    response.success(res);
  };

  changeCheckUpVersion = async (req: Request<{}, {}, ChangeCheckUpVersionParams>, res: Response) => {
    const { user, body: params } = req;

    const [userVersions, currentVersion, newVersion] = await Promise.all([
      CheckUpRepository.findSelectedVersion(user.id, params.babyBookId),
      params.currentId ? CheckUpRepository.getVersionById(params.currentId) : null,
      CheckUpRepository.getVersionById(params.newId),
    ]);

    if (
      currentVersion &&
      (params.currentId === params.newId ||
        !newVersion ||
        !currentVersion.isSuggested ||
        !newVersion.isSuggested ||
        !userVersions.find((uv) => uv.checkUpVersionId === currentVersion.id) ||
        !newVersion.isReleased)
    ) {
      throw new NotFoundError(messages.checkUp.versionNotFound);
    }

    if (!currentVersion && (!newVersion || !newVersion.isSuggested || !newVersion.isReleased)) {
      throw new NotFoundError(messages.checkUp.versionNotFound);
    }

    const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
    if (!existedBabyBook) throw new NotFoundError(messages.babyBook.notFound);

    await withTransaction(async (trans) => {
      const actions: Promise<any>[] = [
        this.createCheckUpScheduleInSuggestedVersion(newVersion, existedBabyBook, user.id, trans),
        this.createUserVersionRelation(user.id, params.babyBookId, newVersion.id, trans),
      ];

      if (user.requestBy) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedBabyBook.id,
          event: SharingChangeEvent.CHANGE_CHECK_UP_VERSION,
          from: {
            version: `${currentVersion.source || ''} ${currentVersion.version || ''} ${`${
              currentVersion.source && currentVersion.name ? '-' : ''
            } ${currentVersion.name || ''}`} ${currentVersion.year || ''}`.trim(),
          },
          to: {
            version: `${newVersion.source || ''} ${newVersion.version || ''} ${`${newVersion.source && newVersion.name ? '-' : ''} ${
              newVersion.name || ''
            }`} ${newVersion.year || ''}`.trim(),
          },
        });
      }

      if (currentVersion) {
        actions.push(
          ...[
            this.destroyScheduleOfCheckUpVersion(currentVersion.id, user.id, params.babyBookId, trans),
            this.destroyUserVersionRelation(user.id, currentVersion.id, params.babyBookId, trans),
          ]
        );
      }
      await Promise.all(actions);
    });

    response.success(res);
  };

  addSuggestedVersion = async (req: Request<{}, {}, AddSuggestedVersionParams>, res: Response) => {
    const { body: params } = req;

    const existedVersion = await CheckUpRepository.findVersionByYear(params);
    if (existedVersion && !existedVersion.isDeleted) {
      throw new BadRequestError(messages.checkUp.versionExists);
    }

    await withTransaction(async (trans) => {
      const version = await this.createVersion(
        {
          name: params.name,
          source: params.source,
          version: params.version,
          isSuggested: true,
          year: params.year,
          isReleased: params.isReleased,
        },
        trans
      );

      await Promise.all(
        params.schedules.map(async (schedule) => {
          await this.createCheckUp(
            {
              checkUpVersionId: version.id,
              isSuggested: true,
              title: schedule.title,
              ageDue: schedule.ageDue,
              monthDue: schedule.monthDue,
            },
            trans
          );
        })
      );
    });

    response.success(res);
  };

  createSuggestedCheckUp = async (req: Request<{}, {}, CreateSuggestedCheckUpParams>, res: Response) => {
    const { body: params } = req;

    const existedVersion = await CheckUpRepository.getVersionById(params.versionId);

    if (!existedVersion || !existedVersion.isSuggested) {
      throw new NotFoundError(messages.checkUp.versionNotFound);
    }

    await Promise.all(
      params.schedules.map(async (schedule) => {
        await withTransaction(async (trans) => {
          await this.createCheckUp(
            {
              title: schedule.title,
              monthDue: schedule.monthDue,
              ageDue: schedule.ageDue,
              isSuggested: true,
              checkUpVersionId: existedVersion.id,
            },
            trans
          );
        });
      })
    );
    response.success(res);
  };

  updateSuggestedCheckUp = async (req: Request<{}, {}, UpdateSuggestedCheckUpParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const existedCheckUp = await CheckUpRepository.getCheckUpById(id);

    if (!existedCheckUp || !existedCheckUp.isSuggested) {
      throw new NotFoundError(messages.checkUp.notFound);
    }

    await withTransaction(async (trans) => {
      await this.updateCheckUp(
        existedCheckUp,
        {
          title: req.body.title,
        },
        trans
      );
    });
    response.success(res);
  };

  deleteSuggestedCheckUp = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const existedCheckUp = await CheckUpRepository.getCheckUpById(id);

    if (!existedCheckUp || !existedCheckUp.isSuggested) {
      throw new NotFoundError(messages.checkUp.notFound);
    }

    await withTransaction(async (trans) => {
      await this.destroyCheckUp(id, trans);
    });
    response.success(res);
  };

  updateVersion = async (req: Request<{}, {}, UpdateVersionParams>, res: Response) => {
    const { id } = req.params as { id: string };

    const existedVersion = await CheckUpRepository.getVersionById(id);

    if (!existedVersion) {
      throw new NotFoundError(messages.checkUp.versionNotFound);
    }
    if (has(req.body, 'isReleased') && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenError(messages.auth.permissionDenied);
    }

    await withTransaction(async (trans) => {
      await this.updateVersionService(existedVersion, req.body, trans);
    });

    response.success(res, checkUpVersionSerializer(existedVersion));
  };

  deleteVersion = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const existedVersion = await CheckUpRepository.getVersionById(id);
    if (
      !existedVersion ||
      (!existedVersion.isSuggested && existedVersion.userId !== req.user.id) ||
      (existedVersion.isSuggested && req.user.role !== UserRole.ADMIN)
    )
      throw new NotFoundError(messages.vaccination.notFound);

    await withTransaction(async (trans) => {
      await existedVersion.update({ isDeleted: true }, { transaction: trans });
    });

    response.success(res);
  };
}

export default new CheckUpController();
