import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { CheckUpFileAttributes, CheckUpFileCreation, CheckUpScheduleAttributes } from '../interfaces/CheckUp';
import CheckUpScheduleModel from './CheckUpSchedule';

class CheckUpFileModel extends Model<CheckUpFileAttributes | CheckUpFileCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId?: string;
  declare checkUpVersionId?: string;
  declare checkUpScheduleId?: string;
  declare filename: string;
  declare pathname: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
  declare fileSize: number;
  declare translatedText?: string;
  declare fileSchedule?: CheckUpScheduleAttributes;
}

CheckUpFileModel.init(
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
      onDelete: 'CASCADE',
    },
    checkUpVersionId: {
      type: DataTypes.UUID,
      field: 'check_up_version_id',
      onDelete: 'CASCADE',
    },
    checkUpScheduleId: {
      type: DataTypes.UUID,
      field: 'check_up_schedule_id',
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(200),
    },
    pathname: {
      type: DataTypes.STRING(200),
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
    translatedText: {
      type: DataTypes.TEXT({
        length: 'long',
      }),
      field: 'translated_text',
    },
  },
  {
    tableName: 'check_up_file',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

CheckUpFileModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

CheckUpFileModel.beforeUpdate(() => {});

CheckUpFileModel.belongsTo(CheckUpScheduleModel, { as: 'fileSchedule', foreignKey: 'check_up_schedule_id' });

export default CheckUpFileModel;
