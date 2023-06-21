import { PaginationParams } from '../common/helpers/pagination/types';

export interface MilestoneGroupAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MilestoneGroupCreation = Omit<MilestoneGroupAttributes, 'id'>;

export interface MilestoneAgeAttributes {
  id: string;
  day: number;
  month: number;
  year: number;
  subject: string;
  createdAt?: Date;
  updatedAt?: Date;
  behavior?: MilestoneBehaviorAttributes[];
}

export type MilestoneAgeCreation = Omit<MilestoneAgeAttributes, 'id'>;

export interface MilestoneBehaviorAttributes {
  id: string;
  groupId: string;
  ageId: string;
  behavior: string;
  createdAt?: Date;
  updatedAt?: Date;
  age?: MilestoneAgeAttributes;
  group?: MilestoneGroupAttributes;
}

export type MilestoneBehaviorCreation = Omit<MilestoneBehaviorAttributes, 'id'>;

export interface MilestoneBehaviorListParams {
  groupId?: string;
  ageId?: string;
}

export interface MilestoneAlbumAttributes {
  id: string;
  userId: string;
  isStandard: boolean;
  babyBookId: string;
  name: string;
  thumbnail?: string;
  isDeleted: boolean;
  totalMilestone: number;
  totalPhoto: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MilestoneAlbumCreation = Omit<MilestoneAlbumAttributes, 'id'>;

export interface MilestoneAttributes {
  id: string;
  albumId: string;
  behaviorId?: string;
  isDeleted: boolean;
  behavior?: MilestoneBehaviorAttributes;
  totalPhoto: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MilestoneCreation = Omit<MilestoneAttributes, 'id'>;

export interface MilestonePhotoAttributes {
  id: string;
  milestoneId?: string;
  userId: string;
  milestoneAlbumId?: string;
  babyBookId?: string;
  photo: string;
  caption?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  album?: MilestoneAlbumAttributes;
  fileSize: number;
}

export type MilestonePhotoCreation = Omit<MilestonePhotoAttributes, 'id'>;

export interface CreateMilestoneParams {
  isStandard?: boolean;
  albumName?: string;
  photos?: PhotoParams[];
  behaviorId?: string;
  babyBookId?: string;
}

export interface MilestoneAlbumSearchParams extends PaginationParams {
  isDeleted?: boolean;
  isStandard?: boolean;
  babyBookId?: string;
}

export interface MilestoneSearchParams extends PaginationParams {
  isDeleted?: boolean;
}

export interface MilestonePhotosParams extends PaginationParams {
  isDeleted?: boolean;
  milestoneId?: string;
  babyBookId?: string;
  albumId?: string;
  isGetAll?: boolean;
}

export interface UploadMilestonePhotoParams {
  babyBookId: string;
}

export interface UpdateMilestoneParams {
  albumName?: string;
  photos?: PhotoParams[];
}

export interface UpdateMilestoneAlbumParams {
  albumName?: string;
  thumbnailId?: string;
}

export interface PhotoParams {
  id: string;
  caption: string;
  name: string;
  isThumbnail: boolean;
}

export interface DeletePhotosParams {
  force?: boolean;
}

export interface DeleteAlbumParams {
  force?: boolean;
}

export interface CreateNewBehaviorParams {
  group: string;
  milestones: {
    age: {
      day: number;
      month: number;
      year: number;
    };
    behavior: string;
  }[];
}

export interface UpdateBehaviorParams {
  behavior: string;
}

export interface DeleteBehaviorParams {
  ids?: string[];
}
