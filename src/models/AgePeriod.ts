import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { AgePeriodAttributes, AgePeriodCreation } from '../interfaces/GrowthChart';

class AgePeriodModel extends Model<AgePeriodAttributes | AgePeriodCreation> {
  declare id: string;
  declare minAgeMonth: number;
  declare maxAgeMonth: number;
  declare text: string;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

AgePeriodModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    minAgeMonth: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'min_age_month',
    },
    maxAgeMonth: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'max_age_month',
    },
    text: {
      type: DataTypes.STRING(),
      allowNull: false,
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
    tableName: 'age_period',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

AgePeriodModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default AgePeriodModel;
