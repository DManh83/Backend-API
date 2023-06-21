import { PaginationParams } from '../common/helpers/pagination/types';

export interface CheckUpVersionAttributes {
  id: string;
  userId?: string;
  babyBookId?: string;
  name?: string;
  source?: string;
  version?: string;
  mainColor?: string;
  subColor?: string;
  isSuggested: boolean;
  totalCheckUp: number;
  year?: number;
  isReleased?: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CheckUpVersionCreation = Omit<CheckUpVersionAttributes, 'id'>;

export interface CheckUpAttributes {
  id: string;
  userId?: string;
  checkUpVersionId?: string;
  isSuggested: boolean;
  title: string;
  ageDue?: string;
  monthDue?: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  schedule?: CheckUpScheduleAttributes[];
}

export type CheckUpCreation = Omit<CheckUpAttributes, 'id'>;

export interface CheckUpScheduleAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  checkUpVersionId: string;
  checkUpId: string;
  status?: string;
  isSuggested: boolean;
  dateDue?: Date;
  dateDone?: Date;
  totalFile: number;
  notifyAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  checkUp?: CheckUpAttributes;
}

export type CheckUpScheduleCreation = Omit<CheckUpScheduleAttributes, 'id'>;

export interface UserCheckUpVersionAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  checkUpVersionId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  version?: CheckUpVersionAttributes;
}

export type UserCheckUpVersionCreation = Omit<UserCheckUpVersionAttributes, 'id'>;

export interface CheckUpFileAttributes {
  id: string;
  userId: string;
  babyBookId?: string;
  checkUpVersionId?: string;
  checkUpScheduleId?: string;
  filename: string;
  pathname: string;
  isDeleted: boolean;
  translatedText?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  fileSize: number;
}

export type CheckUpFileCreation = Omit<CheckUpFileAttributes, 'id'>;

export interface GetCheckUpVersionListParams extends PaginationParams {
  isSuggested?: boolean;
  isReleased?: boolean;
  userId?: string;
  babyBookId?: string;
}

export interface GetSelectedCheckUpVersionParams {
  babyBookId?: string;
}

export interface GetListCheckUpParams extends PaginationParams {
  page?: number;
  pageSize?: number;
  checkUpVersionId?: string;
  babyBookId?: string;
}

export interface GetListCheckUpFilesParams extends PaginationParams {
  isDeleted?: boolean;
  checkUpVersionId?: string;
  checkUpScheduleId?: string;
}

export interface ChangeCheckUpVersionParams {
  currentId?: string;
  newId: string;
  babyBookId: string;
}

export interface CreateCheckUpParams {
  babyBookId: string;
  checkUpVersionId: string;
  title: string;
  dateDue: Date;
  notifyAt?: Date;
  status?: string;
  ageDue?: string;
  monthDue?: number;
  files?: string[];
}

export interface UpdateCheckUpScheduleParams {
  dateDone?: Date;
  title?: string;
  dateDue?: Date;
  notifyAt?: Date;
  status?: string;
  ageDue?: string;
  monthDue?: number;
  files?: string[];
}

export interface DeleteCheckUpFileParams {
  ids?: string[];
  force?: boolean;
}

export interface UndoCheckUpFileParams {
  ids: string[];
}

export interface AddSuggestedVersionParams {
  name: string;
  source: string;
  version: string;
  year: number;
  schedules: {
    monthDue: number;
    ageDue: string;
    title: string;
  }[];
  isReleased: boolean;
}

export interface CreateSuggestedCheckUpParams {
  versionId: string;
  schedules: {
    monthDue: number;
    ageDue: string;
    title: string;
  }[];
}

export interface UpdateSuggestedCheckUpParams {
  title: string;
}

export interface UpdateVersionParams {
  isReleased?: boolean;
}
