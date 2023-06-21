import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Sex } from '../common/enum';

import sequelize from '../common/lib/Sequelize';
import { GrowthPointAttributes, GrowthPointCreation } from '../interfaces/GrowthChart';

class GrowthPointModel extends Model<GrowthPointAttributes | GrowthPointCreation> {
  declare id: string;
  declare userId?: string;
  declare babyBookId?: string;
  declare date?: Date;
  declare headCircumference: number;
  declare weight: number;
  declare height: number;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare isPercentile: boolean;
  declare versionYear?: number;
  declare isReleased?: boolean;
  declare level?: string;
  declare sex?: Sex;
  declare ageMonth?: number;
  declare color?: string;
}

GrowthPointModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATE(),
    },
    headCircumference: {
      type: DataTypes.FLOAT(),
      allowNull: false,
      defaultValue: 0,
    },
    weight: {
      type: DataTypes.FLOAT(),
      allowNull: false,
      defaultValue: 0,
    },
    height: {
      type: DataTypes.FLOAT(),
      allowNull: false,
      defaultValue: 0,
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
    isPercentile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_percentile',
    },
    versionYear: {
      type: DataTypes.INTEGER(),
      field: 'version_year',
    },
    isReleased: {
      type: DataTypes.BOOLEAN,
      field: 'is_released',
    },
    level: {
      type: DataTypes.STRING(),
    },
    color: {
      type: DataTypes.STRING(),
    },
    sex: {
      type: DataTypes.ENUM('male', 'female'),
    },
    ageMonth: {
      type: DataTypes.FLOAT(),
    },
  },
  {
    tableName: 'growth_point',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

GrowthPointModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default GrowthPointModel;
