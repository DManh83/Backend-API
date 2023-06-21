import { PaginationParams } from '../common/helpers/pagination/types';

export interface HealthDocumentAttributes {
  id: string;
  userId: string;
  healthFolderId?: string;
  babyBookId?: string;
  filename: string;
  pathname: string;
  isDeleted: boolean;
  translatedText?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  fileSize: number;
  health?: HealthFolderAttributes;
}

export type HealthDocumentCreation = Omit<HealthDocumentAttributes, 'id'>;

export interface HealthFolderAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  name: string;
  totalDocument: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HealthFolderCreation = Omit<HealthFolderAttributes, 'id'>;

export interface UploadHealthFolderParams {
  babyBookId?: string;
  name: string;
  files: string[];
}

export interface UpdateHealthDocumentParams {
  filename: string;
}

export interface ListHealthFolderParams extends PaginationParams {
  isDeleted?: boolean;
  babyBookId?: string;
}

export interface ListHealthDocumentParams extends PaginationParams {
  isDeleted?: boolean;
  babyBookId?: string;
  folderId?: string;
}

export interface DeleteHealthDocumentParams {
  force?: boolean;
}

export interface DeleteHealthFolderParams {
  force?: boolean;
}
