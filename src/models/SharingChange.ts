import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { SharingChangeAttributes, SharingChangeCreation } from '../interfaces/BabyBook';
import BabyBookModel from './BabyBook';

class SharingChangeModel extends Model<SharingChangeAttributes | SharingChangeCreation> {
  declare id: string;
  declare userId: string;
  declare email: string;
  declare babyBookId: string;
  declare event: string;
  declare from?: Object;
  declare to?: Object;
  declare isDeleted?: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
}

SharingChangeModel.init(
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
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    event: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    from: {
      type: DataTypes.JSONB,
    },
    to: {
      type: DataTypes.JSONB,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
  },
  {
    tableName: 'sharing_change',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

SharingChangeModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

SharingChangeModel.belongsTo(BabyBookModel, { as: 'babyBook', foreignKey: 'babyBookId' });

export default SharingChangeModel;
