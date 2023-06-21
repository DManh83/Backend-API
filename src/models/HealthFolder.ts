import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { HealthFolderAttributes, HealthFolderCreation } from '../interfaces/Health';

class HealthFolderModel extends Model<HealthFolderAttributes | HealthFolderCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare name: string;
  declare totalDocument: number;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date | null;
}

HealthFolderModel.init(
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
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      allowNull: false,
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    totalDocument: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_document',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_deleted',
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE(),
      field: 'deleted_at',
    },
  },
  {
    tableName: 'health_folder',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

HealthFolderModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

HealthFolderModel.beforeUpdate(() => {});

export default HealthFolderModel;
