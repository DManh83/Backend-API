import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NotificationAttributes, NotificationCreation } from '../interfaces/Notification';
import BabyBookModel from './BabyBook';

class NotificationModel extends Model<NotificationAttributes | NotificationCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId?: string;
  declare event: string;
  declare entityId?: string;
  declare isSeen: boolean;
  declare metadata?: Object;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

NotificationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    event: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id',
      onDelete: 'CASCADE',
    },
    metadata: {
      type: DataTypes.JSONB,
    },
    isSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_seen',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    deletedAt: {
      type: DataTypes.DATE(),
      field: 'deleted_at',
    },
  },
  {
    tableName: 'notification',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NotificationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

BabyBookModel.hasMany(NotificationModel, { as: 'babyBook', foreignKey: 'babyBookId', hooks: true });
NotificationModel.belongsTo(BabyBookModel, { as: 'babyBook', foreignKey: 'babyBookId' });

export default NotificationModel;
