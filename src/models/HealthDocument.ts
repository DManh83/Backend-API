import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { HealthDocumentAttributes, HealthDocumentCreation, HealthFolderAttributes } from '../interfaces/Health';
import HealthFolderModel from './HealthFolder';

class HealthDocumentModel extends Model<HealthDocumentAttributes | HealthDocumentCreation> {
  declare id: string;
  declare userId: string;
  declare healthFolderId?: string;
  declare babyBookId?: string;
  declare filename: string;
  declare pathname: string;
  declare isDeleted: boolean;
  declare translatedText?: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
  declare fileSize: number;
  declare documentFolder?: HealthFolderAttributes;
}

HealthDocumentModel.init(
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
    healthFolderId: {
      type: DataTypes.UUID,
      field: 'health_folder_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(200),
    },
    pathname: {
      type: DataTypes.STRING(200),
    },
    translatedText: {
      type: DataTypes.TEXT({
        length: 'long',
      }),
      field: 'translated_text',
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
    fileSize: {
      type: DataTypes.INTEGER(),
      defaultValue: 0,
      allowNull: false,
      field: 'file_size',
    },
  },
  {
    tableName: 'health_document',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

HealthDocumentModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

HealthDocumentModel.beforeUpdate(() => {});

HealthDocumentModel.belongsTo(HealthFolderModel, { foreignKey: 'health_folder_id', as: 'documentFolder' });
HealthFolderModel.hasMany(HealthDocumentModel, { foreignKey: 'health_folder_id', onDelete: 'CASCADE', hooks: true });

export default HealthDocumentModel;
