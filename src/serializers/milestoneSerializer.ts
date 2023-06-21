import dayjs from 'dayjs';

import env from '../../config/env';
import imageStore from '../common/helpers/imageStore';
import {
  MilestoneAgeAttributes,
  MilestoneAlbumAttributes,
  MilestoneAttributes,
  MilestoneBehaviorAttributes,
  MilestoneGroupAttributes,
  MilestonePhotoAttributes,
} from '../interfaces/Milestone';

export const milestoneGroupSerialize = (group: MilestoneGroupAttributes) => ({
  id: group.id,
  name: group.name,
});

export const milestoneGroupSerializeMultiple = (groups: MilestoneGroupAttributes[]) => {
  const serializedGroup = groups.map((group) => milestoneGroupSerialize(group));
  return serializedGroup;
};

export const milestoneAgeSerializeMultiple = (ages: MilestoneAgeAttributes[]) => {
  const serializedGroup = ages.map((age) => milestoneAgeSerialize(age));
  return serializedGroup;
};

export const milestoneAgeSerialize = (age: MilestoneAgeAttributes) => ({
  id: age.id,
  day: age.day,
  month: age.month,
  year: age.year,
  subject: age.subject,
  behavior: age.behavior ? age.behavior.map(milestoneBehaviorSerialize) : null,
});

export const milestoneBehaviorSerializeMultiple = (behaviors: MilestoneBehaviorAttributes[]) => {
  const serializedGroup = behaviors.map((behavior) => milestoneBehaviorSerialize(behavior));
  return serializedGroup;
};

export const milestoneBehaviorSerialize = (behavior: MilestoneBehaviorAttributes) => ({
  id: behavior.id,
  behavior: behavior.behavior,
  age: behavior.age ? milestoneAgeSerialize(behavior.age) : null,
  group: behavior.group ? milestoneGroupSerialize(behavior.group) : null,
  ageId: behavior.ageId,
  groupId: behavior.groupId,
});

export const milestoneAlbumSerialize = (album: MilestoneAlbumAttributes) => ({
  id: album.id,
  userId: album.userId,
  babyBookId: album.babyBookId,
  isStandard: album.isStandard,
  name: album.name,
  thumbnail: imageStore.getUrl(album.userId, album.thumbnail),
  isDeleted: album.isDeleted,
  totalMilestone: album.totalMilestone,
  totalPhoto: album.totalPhoto,
  createdAt: album.createdAt,
  updatedAt: album.updatedAt,
  destroyAt: album.isDeleted ? dayjs(album.updatedAt).add(Number(env.milestoneRetentionPeriod), 'days') : null,
});

export const milestoneSerialize = (milestone: MilestoneAttributes) => ({
  id: milestone.id,
  albumId: milestone.albumId,
  behavior: milestone.behavior ? milestoneBehaviorSerialize(milestone.behavior) : null,
  createdAt: milestone.createdAt,
  updatedAt: milestone.updatedAt,
  totalPhoto: milestone.totalPhoto,
});

export const milestonePhotoSerialize = (photo: MilestonePhotoAttributes) => ({
  id: photo.id,
  milestoneId: photo.milestoneId || null,
  milestoneAlbumId: photo.milestoneAlbumId || null,
  babyBookId: photo.babyBookId,
  userId: photo.userId,
  photo: imageStore.getUrl(photo.userId, photo.photo),
  isThumbnail: photo.album && photo.album.thumbnail === photo.photo,
  name: photo.photo,
  caption: photo.caption,
  isDeleted: photo.isDeleted,
  createdAt: photo.createdAt,
  updatedAt: photo.updatedAt,
  destroyAt: photo.isDeleted ? dayjs(photo.updatedAt).add(Number(env.milestoneRetentionPeriod), 'days') : null,
});
