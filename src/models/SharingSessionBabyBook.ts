import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { SharingSessionBabyBookAttributes, SharingSessionBabyBookCreation } from '../interfaces/BabyBook';

import BabyBookModel from './BabyBook';
import SharingSessionModel from './SharingSession';

class SharingSessionBabyBookModel extends Model<SharingSessionBabyBookAttributes | SharingSessionBabyBookCreation> {
  declare id: string;
  declare sessionId: string;
  declare babyBookId: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
}

SharingSessionBabyBookModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'session_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
  },
  {
    tableName: 'sharing_session_baby_book',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

SharingSessionModel.hasMany(SharingSessionBabyBookModel, {
  foreignKey: 'session_id',
  as: 'sessionBabyBook',
  onDelete: 'CASCADE',
  hooks: true,
});
SharingSessionBabyBookModel.belongsTo(BabyBookModel, {
  foreignKey: 'baby_book_id',
  as: 'sharedBabyBook',
  hooks: true,
});

SharingSessionBabyBookModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default SharingSessionBabyBookModel;
