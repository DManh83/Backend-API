import { NotificationAttributes } from '../interfaces/Notification';
import { babyBookSerializer } from './babybookSerializer';

export const notificationSerializer = (notification: NotificationAttributes) => {
  const serializer = {
    id: notification.id,
    babyBookId: notification.babyBookId,
    event: notification.event,
    entityId: notification.entityId,
    isSeen: notification.isSeen,
    metadata: notification.metadata,
    isDeleted: notification.isDeleted,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
  return notification.babyBook
    ? {
        ...serializer,
        babyBook: babyBookSerializer(notification.babyBook),
      }
    : serializer;
};
