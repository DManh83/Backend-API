import { BabyBookAttributes } from './BabyBook';

export interface NotificationAttributes {
  id: string;
  userId: string;
  babyBookId?: string;
  event: string;
  entityId?: string;
  isSeen: boolean;
  isDeleted: boolean;
  metadata?: Object;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  babyBook?: BabyBookAttributes;
}

export type NotificationCreation = Omit<NotificationAttributes, 'id'>;

export interface UpdateNotificationParams {
  isSeen: boolean;
}
