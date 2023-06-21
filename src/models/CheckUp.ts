import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { CheckUpAttributes, CheckUpCreation, CheckUpScheduleAttributes } from '../interfaces/CheckUp';

import CheckUpScheduleModel from './CheckUpSchedule';
import CheckUpVersionModel from './CheckUpVersion';

class CheckUpModel extends Model<CheckUpAttributes | CheckUpCreation> {
  declare id: string;
  declare userId?: string;
  declare checkUpVersionId?: string;
  declare isSuggested: boolean;
  declare title: string;
  declare ageDue?: string;
  declare monthDue?: number;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare schedule?: CheckUpScheduleAttributes[];
}

CheckUpModel.init(
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
    checkUpVersionId: {
      type: DataTypes.UUID,
      field: 'check_up_version_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    title: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    ageDue: {
      type: DataTypes.STRING(),
      field: 'age_due',
    },
    monthDue: {
      type: DataTypes.STRING(),
      field: 'month_due',
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
    tableName: 'check_up',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

CheckUpModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

CheckUpVersionModel.hasMany(CheckUpModel, {
  foreignKey: 'checkUpVersionId',
  as: 'checkUp',
  onDelete: 'CASCADE',
  hooks: true,
});
CheckUpModel.hasMany(CheckUpScheduleModel, { foreignKey: 'check_up_id', as: 'schedule', onDelete: 'CASCADE', hooks: true });
CheckUpScheduleModel.belongsTo(CheckUpModel, { foreignKey: 'check_up_id', as: 'checkUp' });

export default CheckUpModel;
