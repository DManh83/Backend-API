import dayjs from 'dayjs';
import env from '../../config/env';
import imageStore from '../common/helpers/imageStore';
import { BabyBookAttributes, SharingChangeAttributes, SharingSessionAttributes } from '../interfaces/BabyBook';

export const babyBookSerializer = (babyBook: BabyBookAttributes) => ({
  id: babyBook.id,
  name: babyBook.name,
  photo: imageStore.getUrl(babyBook.userId, babyBook.photo),
  birthday: babyBook.birthday,
  indigenous: babyBook.indigenous,
  medicalCondition: babyBook.medicalCondition,
  isDeleted: babyBook.isDeleted,
  createdAt: babyBook.createdAt,
  updatedAt: babyBook.updatedAt,
  userId: babyBook.userId,
  destroyAt: babyBook.isDeleted ? dayjs(babyBook.updatedAt).add(Number(env.babyBookRetentionPeriod), 'days') : null,
});

export const sharingSessionSerializer = (session: SharingSessionAttributes) => ({
  id: session.id,
  userId: session.userId,
  email: session.email,
  sharedAt: session.sharedAt,
  availableAfter: session.availableAfter,
  duration: session.duration,
  totalBabyBook: session.totalBabyBook,
  expiredAfter: session.expiredAfter,
  isDeleted: session.isDeleted,
  createdAt: session.createdAt,
  role: session.role,
  babyBooks: session.sessionBabyBook?.map((sb) => babyBookSerializer(sb.sharedBabyBook)),
});

export const sharingChangeSerializer = (sharingChange: SharingChangeAttributes) => ({
  id: sharingChange.id,
  userId: sharingChange.userId,
  email: sharingChange.email,
  babyBookId: sharingChange.babyBookId,
  event: sharingChange.event,
  from: sharingChange.from || {},
  to: sharingChange.to || {},
  createdAt: sharingChange.createdAt,
  babyBook: sharingChange.babyBook,
});
