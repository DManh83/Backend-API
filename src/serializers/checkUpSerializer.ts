import dayjs from 'dayjs';

import env from '../../config/env';
import imageStore from '../common/helpers/imageStore';
import { CheckUpAttributes, CheckUpFileAttributes, CheckUpVersionAttributes, UserCheckUpVersionAttributes } from '../interfaces/CheckUp';

export const checkUpVersionSerializer = (version: CheckUpVersionAttributes) => ({
  id: version.id,
  name: version.name,
  source: version.source,
  version: version.version,
  mainColor: version.mainColor,
  subColor: version.subColor,
  isSuggested: version.isSuggested,
  totalCheckUp: version.totalCheckUp,
  isDeleted: version.isDeleted,
  createdAt: version.createdAt,
  updatedAt: version.updatedAt,
  babyBookId: version.babyBookId,
  year: version.year,
});

export const userCheckUpVersionSerializer = (userVersion: UserCheckUpVersionAttributes) => ({
  id: userVersion.id,
  checkUpVersionId: userVersion.checkUpVersionId,
  checkUpVersion: userVersion.version || null,
});

export const checkUpSerializer = (checkUp: CheckUpAttributes) => ({
  id: checkUp.id,
  checkUpVersionId: checkUp.checkUpVersionId,
  isSuggested: checkUp.isSuggested,
  title: checkUp.title,
  ageDue: checkUp.ageDue,
  monthDue: checkUp.monthDue,
  isDeleted: checkUp.isDeleted,
  createdAt: checkUp.createdAt,
  dateDue: checkUp.schedule[0]?.dateDue,
  status: checkUp.schedule[0]?.status,
  dateDone: checkUp.schedule[0]?.dateDone,
  notifyAt: checkUp.schedule[0]?.notifyAt,
  checkUpScheduleId: checkUp.schedule[0]?.id,
});

export const checkUpFileSerializer = (file: CheckUpFileAttributes) => ({
  id: file.id,
  babyBookId: file.babyBookId,
  checkUpVersionId: file.checkUpVersionId,
  checkUpScheduleId: file.checkUpScheduleId,
  filename: file.filename,
  fileUrl: imageStore.getUrl(file.userId, file.pathname),
  isDeleted: file.isDeleted,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
  destroyAt: file.isDeleted ? dayjs(file.deletedAt).add(Number(env.checkUpRetentionPeriod), 'days') : null,
});
