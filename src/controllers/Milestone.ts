import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { SharingChangeEvent } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ConflictError from '../common/errors/types/ConflictError';
import NoContent from '../common/errors/types/NoContent';
import NotFoundError from '../common/errors/types/NotFoundError';
import { parseFormData } from '../common/helpers/convert';
import { paginationSerializer } from '../common/helpers/pagination/utils';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import messages from '../common/messages';
import { SharingChangeAttributes } from '../interfaces/BabyBook';
import {
  CreateMilestoneParams,
  CreateNewBehaviorParams,
  DeleteAlbumParams,
  DeleteBehaviorParams,
  DeletePhotosParams,
  MilestoneAlbumCreation,
  MilestoneAlbumSearchParams,
  MilestoneAttributes,
  MilestoneBehaviorListParams,
  MilestoneCreation,
  MilestonePhotosParams,
  UpdateBehaviorParams,
  UpdateMilestoneAlbumParams,
  UpdateMilestoneParams,
  UploadMilestonePhotoParams,
} from '../interfaces/Milestone';
import BabyBookModel from '../models/BabyBook';
import MilestoneModel from '../models/Milestone';
import MilestonePhotoModel from '../models/MilestonePhoto';
import SharingChangeModel from '../models/SharingChange';
import MilestoneRepository from '../repositories/Milestone';
import { babyBookSerializer } from '../serializers/babybookSerializer';
import {
  milestoneAgeSerialize,
  milestoneAgeSerializeMultiple,
  milestoneAlbumSerialize,
  milestoneBehaviorSerializeMultiple,
  milestoneGroupSerialize,
  milestoneGroupSerializeMultiple,
  milestonePhotoSerialize,
  milestoneSerialize,
} from '../serializers/milestoneSerializer';
import MilestoneServices from '../services/Milestone';

import { MulterRequest } from './BabyBook';

class MilestoneController extends MilestoneServices {
  public listGroups = async (req: Request, res: Response) => {
    const groups = await MilestoneRepository.getGroups();
    response.success(res, milestoneGroupSerializeMultiple(groups));
  };

  public listAges = async (req: Request<{}, {}, {}, { groupId?: string }>, res: Response) => {
    const ages = await MilestoneRepository.getAges(req.query.groupId);
    response.success(res, milestoneAgeSerializeMultiple(ages));
  };

  public listBehaviors = async (req: Request<{}, {}, {}, MilestoneBehaviorListParams>, res: Response) => {
    const behaviors = await MilestoneRepository.getBehaviors(req.query);
    response.success(res, milestoneBehaviorSerializeMultiple(behaviors));
  };

  public listAllBehaviors = async (_req: Request, res: Response) => {
    const groups = await MilestoneRepository.getGroups();

    const result = await Promise.all(
      groups.map(async (group) => {
        const ages = await MilestoneRepository.getBehaviorsByGroupId(group.id);

        return {
          ...milestoneGroupSerialize(group),
          age: ages.map(milestoneAgeSerialize),
        };
      })
    );

    response.success(res, result);
  };

  public uploadMilestonePhoto = async (req: Request<{}, {}, UploadMilestonePhotoParams>, res: Response) => {
    const { file } = req as MulterRequest;
    if (!file) {
      throw new NoContent(messages.milestone.noFileUpload);
    }
    const photoRecord = await this.uploadPhoto(req);
    response.success(res, milestonePhotoSerialize(photoRecord));
  };

  public createMilestone = async (req: Request<{}, {}, CreateMilestoneParams>, res: Response) => {
    const { user, body: milestoneData } = req;

    let existedAlbum = await MilestoneRepository.findAlbumByName(user.id, milestoneData.babyBookId, milestoneData.albumName);

    let newMilestone;

    if (existedAlbum && !existedAlbum.isDeleted) {
      if (!milestoneData.isStandard) {
        throw new BadRequestError(messages.milestone.albumNameExists);
      }
      const existedMilestone = await MilestoneModel.findOne({
        where: {
          albumId: existedAlbum.id,
          behaviorId: milestoneData.behaviorId,
        },
      });

      if (existedMilestone && !existedMilestone.isDeleted) {
        throw new BadRequestError(messages.milestone.alreadyExist);
      }
      newMilestone = existedMilestone;
    }

    if (!milestoneData.photos.length) {
      throw new NoContent(messages.milestone.noFileUpload);
    }

    await withTransaction(async (trans) => {
      if (!existedAlbum) {
        existedAlbum = await this.createMilestoneAlbum(user, milestoneData, trans);
      }

      let thumbnailFile = milestoneData.photos.find((photo) => photo.isThumbnail);
      if (!thumbnailFile && (!existedAlbum.thumbnail || existedAlbum.isDeleted)) {
        thumbnailFile = { ...milestoneData.photos[0] };
      }

      if (thumbnailFile) {
        await this.updateMilestoneAlbum(existedAlbum, { thumbnail: thumbnailFile.name }, trans);
      }

      if (existedAlbum.isDeleted && !newMilestone) {
        const whereCond: WhereOptions<MilestoneAttributes | MilestoneCreation> = { albumId: existedAlbum.id };
        if (existedAlbum.isStandard) {
          whereCond.behaviorId = milestoneData.behaviorId;
        }
        newMilestone = await MilestoneModel.findOne({ where: whereCond });
      }

      newMilestone = newMilestone || (await this.createMilestoneService(existedAlbum, milestoneData.behaviorId, trans));

      if (existedAlbum.isDeleted) {
        existedAlbum.isDeleted = false;
        await existedAlbum.save({ transaction: trans });
      }

      if (user.requestBy) {
        const existedBehavior = await MilestoneRepository.findBehaviorById(milestoneData.behaviorId);
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedAlbum.babyBookId,
          event: SharingChangeEvent.CREATE_MILESTONE_ALBUM,
          to: {
            name: existedBehavior
              ? `${existedAlbum.name} - ${existedBehavior.behavior} - ${existedBehavior.age.year * 12 + existedBehavior.age.month} month(s)`
              : existedAlbum.name,
          },
        });
      }

      await this.updateMilestonePhotos(newMilestone.id, user.id, existedAlbum, milestoneData.photos, trans);
    });

    response.success(res, milestoneSerialize(newMilestone));
  };

  public updateMilestone = async (req: Request<{}, {}, UpdateMilestoneParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { body: updatingData, user } = req;

    const existedMilestone = await MilestoneRepository.findMilestoneById(id);
    if (!existedMilestone) {
      throw new NotFoundError(messages.milestone.milestoneNotFound);
    }

    if (!updatingData.photos.length) {
      throw new NoContent(messages.milestone.noFileUpload);
    }

    await withTransaction(async (trans) => {
      const existedAlbum = await MilestoneRepository.findAlbumById(existedMilestone.albumId);
      const newAlbum: Partial<MilestoneAlbumCreation> = {};

      if (updatingData.albumName && existedAlbum.name !== updatingData.albumName) {
        newAlbum.name = updatingData.albumName;
      }
      const thumbnailFile = updatingData.photos.find((photo) => photo.isThumbnail);
      if (thumbnailFile) {
        newAlbum.thumbnail = thumbnailFile.name;
      }

      await this.updateMilestoneAlbum(existedAlbum, newAlbum, trans);

      const totalAdded = await this.updateMilestonePhotos(id, req.user.id, existedAlbum, updatingData.photos, trans);

      if (user.requestBy && totalAdded) {
        SharingChangeModel.create({
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedAlbum.babyBookId,
          event: SharingChangeEvent.ADD_FILE_TO_MILESTONE,
          to: {
            total: totalAdded - existedMilestone.totalPhoto,
            albumId: existedAlbum.id,
            albumName: existedAlbum.name,
            milestoneName: existedMilestone.behavior?.behavior,
          },
        });
      }
    });

    response.success(res, milestoneSerialize(existedMilestone));
  };

  public updateAlbum = async (req: Request<{}, {}, UpdateMilestoneAlbumParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;
    const updatingData = req.body;

    const existedAlbum = await MilestoneRepository.findAlbumById(id);
    if (!existedAlbum) {
      throw new NotFoundError(messages.milestone.albumNotFound);
    }

    const newAlbum: Partial<MilestoneAlbumCreation> = {};
    const changes: SharingChangeAttributes[] = [];

    if (updatingData.albumName) {
      if (existedAlbum.isStandard && existedAlbum.name !== updatingData.albumName) {
        throw new ConflictError(messages.milestone.updateAlbumNameFailed);
      }

      const duplicatedAlbum = await MilestoneRepository.findAlbumByName(
        existedAlbum.userId,
        existedAlbum.babyBookId,
        updatingData.albumName
      );
      if (duplicatedAlbum) {
        throw new BadRequestError(messages.milestone.albumNameExists);
      }
      if (user.requestBy) {
        changes.push({
          id: uuidv4(),
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedAlbum.babyBookId,
          event: SharingChangeEvent.UPDATE_MILESTONE_ALBUM,
          from: {
            albumName: existedAlbum.name,
          },
          to: {
            albumId: existedAlbum.id,
            albumName: updatingData.albumName,
          },
        });
      }
      newAlbum.name = updatingData.albumName;
    }
    if (updatingData.thumbnailId) {
      const thumbnail = await MilestonePhotoModel.findOne({ where: { id: updatingData.thumbnailId } });
      if (!thumbnail || thumbnail.milestoneAlbumId !== existedAlbum.id) {
        throw new NotFoundError(messages.milestone.photoNotFound);
      }
      newAlbum.thumbnail = thumbnail.photo;
      if (user.requestBy) {
        changes.push({
          id: uuidv4(),
          userId: user.id,
          email: user.requestBy,
          babyBookId: existedAlbum.babyBookId,
          event: SharingChangeEvent.UPDATE_MILESTONE_ALBUM,
          to: {
            albumId: existedAlbum.id,
            albumName: existedAlbum.name,
          },
        });
      }
    }

    await withTransaction(async (trans) => {
      await this.updateMilestoneAlbum(existedAlbum, newAlbum, trans);
    });

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }

    response.success(res, milestoneAlbumSerialize(existedAlbum));
  };

  public listMilestoneAlbum = async (req: Request<{}, {}, {}, MilestoneAlbumSearchParams>, res: Response) => {
    const params: MilestoneAlbumSearchParams = parseFormData(req.query, ['isDeleted', 'isStandard']);
    const { session } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === params.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const albums = await MilestoneRepository.findAlbumWithPagination({ userId: req.user?.id || session?.userId, paginationParams: params });

    response.success(res, paginationSerializer(albums, milestoneAlbumSerialize));
  };

  public getSingleAlbum = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      session,
      query: { babyBookId },
    } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const existedAlbum = await MilestoneRepository.findAlbumById(id);
    if (!existedAlbum || (babyBookId && existedAlbum.babyBookId !== babyBookId)) {
      throw new NotFoundError(messages.milestone.albumNotFound);
    }

    const milestoneList = await MilestoneRepository.findMilestoneWithPaginate({ albumId: id, paginationParams: req.query });
    const milestones = paginationSerializer(milestoneList, milestoneSerialize);

    response.success(res, {
      album: milestoneAlbumSerialize(existedAlbum),
      milestones,
    });
  };

  public getMilestoneById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const {
      session,
      query: { babyBookId },
    } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    const milestone = await MilestoneRepository.findMilestoneById(id);
    response.success(res, milestoneSerialize(milestone));
  };

  public getMilestonePhotos = async (req: Request<{}, {}, {}, MilestonePhotosParams>, res: Response) => {
    const params: MilestonePhotosParams = parseFormData(req.query, ['isDeleted', 'isGetAll']);
    const dataResponse: any = {};
    const { session } = req;

    if (session && !session.sessionBabyBook.find((s) => s.babyBookId === params.babyBookId)) {
      throw new NotFoundError(messages.babyBook.notFound);
    }

    if (params.milestoneId) {
      const existedMilestone = await MilestoneRepository.findMilestoneById(params.milestoneId);
      if (!existedMilestone) {
        throw new NotFoundError(messages.milestone.milestoneNotFound);
      }
      dataResponse.milestone = milestoneSerialize(existedMilestone);
    } else if (params.babyBookId) {
      const existedBabyBook = await BabyBookModel.findOne({ where: { id: params.babyBookId } });
      if (!existedBabyBook) {
        throw new NotFoundError(messages.babyBook.notFound);
      }
      dataResponse.babyBook = babyBookSerializer(existedBabyBook);
    } else if (params.albumId) {
      const existedAlbum = await MilestoneRepository.findAlbumById(params.albumId);
      if (!existedAlbum) {
        throw new NotFoundError(messages.milestone.albumNotFound);
      }
      dataResponse.album = milestoneAlbumSerialize(existedAlbum);
    } else {
      throw new BadRequestError(messages.httpMessages[400]);
    }

    if (params.isGetAll) {
      const photoList = await MilestoneRepository.findAllPhotos(params);
      dataResponse.photos = photoList.map(milestonePhotoSerialize);
    } else {
      const photoList = await MilestoneRepository.findPhotoWithPaginate({ paginationParams: params });
      dataResponse.photos = paginationSerializer(photoList, milestonePhotoSerialize);
    }

    response.success(res, dataResponse);
  };

  public deleteMilestonePhotos = async (req: Request<{}, {}, {}, DeletePhotosParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;
    const ids = id.split(',');
    const deleteParams: DeletePhotosParams = parseFormData(req.query, ['force']);

    const photos = await MilestonePhotoModel.findAll({ where: { id: { [Op.in]: ids }, userId: req.user.id } });

    if (photos.length !== ids.length) {
      throw new NotFoundError(messages.milestone.photoNotFound);
    }
    await this.deletePhotos(req.user.id, photos, deleteParams.force);

    if (user.requestBy) {
      const existedMilestone = await MilestoneRepository.findMilestoneById(photos[0].milestoneId, true);

      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: photos[0].babyBookId,
        event: SharingChangeEvent.DELETE_MILESTONE_PHOTO,
        to: {
          total: ids.length,
          albumId: existedMilestone.albumId,
          albumName: existedMilestone.album?.name || '',
          milestoneName: existedMilestone.behavior?.behavior || '',
        },
      });
    }

    response.success(res);
  };

  public undoMilestonePhotos = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const ids = id.split(',');

    const photos = await MilestonePhotoModel.findAll({ where: { id: { [Op.in]: ids }, userId: req.user.id } });

    if (photos.length !== ids.length) {
      throw new NotFoundError(messages.milestone.photoNotFound);
    }

    await MilestonePhotoModel.update({ isDeleted: false }, { where: { id: { [Op.in]: ids } } });

    photos.forEach((photo) => {
      photo.isDeleted = false;
    });

    response.success(res, photos.map(milestonePhotoSerialize));
  };

  public updatePhoto = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;

    const photo = await MilestonePhotoModel.findOne({ where: { id, userId: req.user.id } });

    if (!photo) {
      throw new NotFoundError(messages.milestone.photoNotFound);
    }
    if (user.requestBy) {
      const existedMilestone = await MilestoneRepository.findMilestoneById(photo.milestoneId, true);

      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: photo.babyBookId,
        event: SharingChangeEvent.UPDATE_MILESTONE_PHOTO,
        from: {
          caption: photo.caption || '',
        },
        to: {
          caption: req.body.caption || '',
          milestoneId: photo.milestoneId,
          photoId: photo.id,
          albumName: existedMilestone.album.isStandard
            ? `${existedMilestone.album?.name} - ${existedMilestone.behavior?.behavior} - ${
                (existedMilestone.behavior?.age.year || 0) * 12 + (existedMilestone.behavior?.age.month || 0)
              } month(s)`
            : existedMilestone.album.name,
          milestoneName: existedMilestone.behavior?.behavior || '',
        },
      });
    }

    photo.caption = req.body.caption || '';
    await photo.save();

    response.success(res, milestonePhotoSerialize(photo));
  };

  public deleteAlbum = async (req: Request<{}, {}, {}, DeleteAlbumParams>, res: Response) => {
    const { id } = req.params as { id: string };
    const { user } = req;
    const deleteParams: DeleteAlbumParams = parseFormData(req.query, ['force']);

    const album = await MilestoneRepository.findAlbumById(id);

    if (!album || album.isDeleted) {
      throw new NotFoundError(messages.milestone.albumNotFound);
    }

    await this.deleteMilestoneAlbum(req.user.id, album, deleteParams.force);

    if (user.requestBy) {
      SharingChangeModel.create({
        userId: user.id,
        email: user.requestBy,
        babyBookId: album.babyBookId,
        event: SharingChangeEvent.DELETE_MILESTONE_ALBUM,
        to: {
          albumId: album.id,
          albumName: album.name || '',
        },
      });
    }

    response.success(res);
  };

  public createBehavior = async (req: Request<{}, {}, CreateNewBehaviorParams>, res: Response) => {
    const { body: params } = req;

    let existedGroup = await MilestoneRepository.findGroupByName(params.group);

    await withTransaction(async (trans) => {
      if (!existedGroup) {
        existedGroup = await this.createGroupService(params.group, trans);
      }

      for (const milestone of params.milestones) {
        let existedAge = await MilestoneRepository.findAge(milestone.age);
        if (!existedAge) {
          existedAge = await this.createAgeService(milestone.age, trans);
        }
        const existedBehavior = await MilestoneRepository.findBehavior(existedGroup.id, existedAge.id, milestone.behavior);
        if (!existedBehavior) {
          await this.createBehaviorService(existedGroup.id, existedAge.id, milestone.behavior, trans);
        }
      }
    });

    response.success(res);
  };

  public updateBehavior = async (req: Request<{}, {}, UpdateBehaviorParams>, res: Response) => {
    const params = req.body;
    const { id } = req.params as { id: string };

    const existedBehavior = await MilestoneRepository.findBehaviorById(id);

    if (!existedBehavior) {
      throw new NotFoundError(messages.milestone.milestoneNotFound);
    }

    await withTransaction(async (trans) => {
      existedBehavior.behavior = params.behavior;

      await existedBehavior.save({ transaction: trans });
    });

    response.success(res);
  };

  public deleteBehaviors = async (req: Request<{}, {}, {}, DeleteBehaviorParams>, res: Response) => {
    const params: DeleteBehaviorParams = parseFormData(req.query, ['ids']);

    const behaviors = await MilestoneRepository.findBehaviorByIds(params.ids);
    if (behaviors.length !== params.ids.length) {
      throw new NotFoundError(messages.milestone.milestoneNotFound);
    }

    await withTransaction(async (trans) => {
      await this.deleteBehaviorsService(params.ids, trans);
    });

    response.success(res);
  };

  public validateAlbumName = async (req: Request<{}, {}, { name: string; babyBookId: string }>, res: Response) => {
    const {
      body: { babyBookId, name },
      user,
    } = req;

    const existedAlbum = await MilestoneRepository.findAlbumByName(user.id, babyBookId, name);
    if (existedAlbum) {
      throw new BadRequestError(messages.milestone.albumNameExists);
    }

    response.success(res);
  };
}

export default new MilestoneController();
