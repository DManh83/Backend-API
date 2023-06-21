import { Request } from 'express';
import { get, isEmpty } from 'lodash';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize/types';

import imageStore from '../common/helpers/imageStore';
import { MulterRequest } from '../controllers/BabyBook';
import { CreateMilestoneParams, MilestoneAlbumCreation, MilestonePhotoCreation, PhotoParams } from '../interfaces/Milestone';
import MilestoneModel from '../models/Milestone';
import MilestoneAlbumModel from '../models/MilestoneAlbum';
import MilestonePhotoModel from '../models/MilestonePhoto';
import MilestoneStandardAgeModel from '../models/MilestoneStandardAge';
import MilestoneStandardBehaviorModel from '../models/MilestoneStandardBehavior';
import MilestoneStandardGroupModel from '../models/MilestoneStandardGroup';
import MilestoneRepository from '../repositories/Milestone';

class MilestoneServices {
  public createGroupService = async (name: string, transaction: Transaction) =>
    MilestoneStandardGroupModel.create({ name }, { transaction });

  public createAgeService = async ({ day = 0, month = 0, year = 0 }, transaction: Transaction) =>
    MilestoneStandardAgeModel.create({ day, month, year, subject: 'What your baby can do at' }, { transaction });

  public createBehaviorService = async (groupId: string, ageId: string, behavior: string, transaction: Transaction) =>
    MilestoneStandardBehaviorModel.create({ groupId, ageId, behavior }, { transaction });

  public deleteBehaviorsService = async (ids: string[], transaction: Transaction) =>
    MilestoneStandardBehaviorModel.destroy({ where: { id: { [Op.in]: ids } }, transaction });

  public createMilestoneAlbum = async (user: Express.User, albumParams: CreateMilestoneParams, trans: Transaction) => {
    const newAlbum: MilestoneAlbumCreation = {
      userId: user.id,
      isStandard: albumParams.isStandard,
      name: albumParams.albumName,
      isDeleted: false,
      totalMilestone: 0,
      totalPhoto: 0,
      babyBookId: albumParams.babyBookId,
    };

    const result = await MilestoneAlbumModel.create(newAlbum, { transaction: trans });

    return result;
  };

  public uploadPhoto = async (req: Request) => {
    const { file, user } = req as MulterRequest;
    const photo = get(file, 'filename', null);
    const photoShape: MilestonePhotoCreation = {
      userId: user.id,
      photo,
      isDeleted: true,
      fileSize: file.size,
    };

    return MilestonePhotoModel.create(photoShape);
  };

  public updateMilestoneAlbum = async (album: MilestoneAlbumModel, newData: Partial<MilestoneAlbumCreation>, trans: Transaction) => {
    if (isEmpty(newData)) return;

    if (!album.isStandard && newData.name) {
      album.name = newData.name;
    }
    if (newData.thumbnail) {
      album.thumbnail = newData.thumbnail;
    }
    await album.save({ transaction: trans });
  };

  public updateMilestonePhotos = async (
    milestoneId: string,
    userId: string,
    album: MilestoneAlbumModel,
    listPhotos: PhotoParams[],
    trans: Transaction
  ) => {
    const existedPhotos = await MilestoneRepository.getMilestonePhotos(milestoneId);

    const oldPhotos = existedPhotos
      .filter((photo) => !listPhotos.find((p) => p.name === photo.photo))
      .map((p) => ({
        id: p.id,
        milestoneId: p.isDeleted ? p.milestoneId : null,
        userId: p.userId,
        caption: p.caption,
        photo: p.photo,
        isDeleted: true,
        milestoneAlbumId: p.isDeleted ? p.milestoneAlbumId : null,
        babyBookId: p.isDeleted ? p.babyBookId : null,
        fileSize: p.fileSize,
      }));

    const rawPhotos = await MilestoneRepository.getPhotosByIds(listPhotos.map((p) => p.id));

    const newPhotos = listPhotos.map((p) => ({
      id: p.id,
      milestoneId,
      userId,
      caption: p.caption,
      photo: p.name,
      isDeleted: false,
      milestoneAlbumId: album.id,
      babyBookId: album.babyBookId,
      fileSize: rawPhotos.find((r) => r.id === p.id)?.fileSize || 0,
    }));
    await MilestonePhotoModel.bulkCreate([...oldPhotos, ...newPhotos], {
      updateOnDuplicate: ['milestoneId', 'milestoneAlbumId', 'babyBookId', 'caption', 'isDeleted'],
      transaction: trans,
    });

    return newPhotos.length;
  };

  public createMilestoneService = async (album: MilestoneAlbumModel, behaviorId: string, trans: Transaction) => {
    const milestoneParams = {
      albumId: album.id,
      behaviorId: album.isStandard ? behaviorId : null,
      isDeleted: false,
      totalPhoto: 0,
    };
    return MilestoneModel.create(milestoneParams, { transaction: trans });
  };

  async deletePhotos(userId: string, photos: MilestonePhotoModel[], force?: boolean) {
    return Promise.all(
      photos.map(async (photo) => {
        if (force) {
          await imageStore.deleteFile(userId, photo.photo);
          return photo.destroy();
        }

        photo.isDeleted = true;
        return photo.save();
      })
    );
  }

  async deleteMilestoneAlbum(userId: string, album: MilestoneAlbumModel, force?: boolean) {
    if (force) {
      return album.destroy();
    }

    album.isDeleted = true;
    await MilestonePhotoModel.update({ isDeleted: true }, { where: { milestoneAlbumId: album.id, userId } });
    return album.save();
  }
}

export default MilestoneServices;
