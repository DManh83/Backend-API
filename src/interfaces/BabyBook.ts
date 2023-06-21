import { SharingRole } from '../common/enum';
import { PaginationParams } from '../common/helpers/pagination/types';

export interface BabyBookAttributes {
  id: string;
  userId: string;
  name: string;
  photo?: string;
  birthday: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  indigenous?: boolean;
  medicalCondition?: boolean;
}

export type BabyBookCreation = Omit<BabyBookAttributes, 'id'>;

export interface CreateBabyBookParams {
  name: string;
  photo?: string;
  birthday: Date;
  indigenous?: boolean;
  medicalCondition?: boolean;
}

export interface BabyBookUpdateParams {
  name?: string;
  photo?: string;
  birthday?: Date;
  isRemovePhoto?: string;
  indigenous: boolean;
  medicalCondition: boolean;
}

export interface BabyBookSearchParams extends PaginationParams {
  isDeleted?: boolean;
}

export interface CountBabyBookParams {
  from?: Date;
  to?: Date;
  viewBy?: string;
}

export interface SharingSessionAttributes {
  id: string;
  userId: string;
  email: string;
  sharedAt?: Date;
  availableAfter?: Date;
  duration: number;
  totalBabyBook: number;
  expiredAfter?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  sessionBabyBook?: SharingSessionBabyBookAttributes[];
  role: SharingRole;
}

export type SharingSessionCreation = Omit<SharingSessionAttributes, 'id'>;

export interface SharingChangeAttributes {
  id: string;
  userId: string;
  email: string;
  babyBookId: string;
  event: string;
  from?: Object;
  to?: Object;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  babyBook?: BabyBookAttributes;
}

export type SharingChangeCreation = Omit<SharingChangeAttributes, 'id'>;

export interface SharingSessionBabyBookAttributes {
  id: string;
  sessionId: string;
  babyBookId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  sharedBabyBook?: BabyBookAttributes;
}

export type SharingSessionBabyBookCreation = Omit<SharingSessionBabyBookAttributes, 'id'>;

export interface ShareBabyBookParams {
  email: string;
  duration: number;
  babyBookIds: string[];
  role: SharingRole;
}

export interface VerifySharingSessionParams {
  email: string;
  sessionId: string;
}

export interface CheckDuplicatedSharedBooks {
  email: string;
  babyBookIds: string[];
}
