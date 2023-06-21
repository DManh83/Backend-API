import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { SharingRole } from '../common/enum';
import sequelize from '../common/lib/Sequelize';
import { SharingSessionAttributes, SharingSessionBabyBookAttributes, SharingSessionCreation } from '../interfaces/BabyBook';

class SharingSessionModel extends Model<SharingSessionAttributes | SharingSessionCreation> {
  declare id: string;
  declare userId: string;
  declare email: string;
  declare sharedAt?: Date;
  declare availableAfter?: Date;
  declare duration: number;
  declare totalBabyBook: number;
  declare expiredAfter?: Date;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
  declare role: SharingRole;
  declare sessionBabyBook?: SharingSessionBabyBookAttributes[];
}

SharingSessionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      onDelete: 'CASCADE',
    },
    email: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    sharedAt: {
      type: DataTypes.DATE(),
      field: 'shared_at',
    },
    availableAfter: {
      type: DataTypes.DATE(),
      field: 'available_after',
    },
    duration: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
    },
    totalBabyBook: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_baby_book',
    },
    expiredAfter: {
      type: DataTypes.DATE(),
      field: 'expired_after',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    role: {
      type: DataTypes.ENUM(SharingRole.EDITOR, SharingRole.VIEWER),
      allowNull: false,
      defaultValue: SharingRole.VIEWER,
    },
  },
  {
    tableName: 'sharing_session',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

SharingSessionModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default SharingSessionModel;
