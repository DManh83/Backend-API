import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { ImmunizationAttributes, ImmunizationCreation } from '../interfaces/Immunization';
import ImmunizationScheduleModel from './ImmunizationSchedule';
import VaccinationModel from './Vaccination';

class ImmunizationModel extends Model<ImmunizationAttributes | ImmunizationCreation> {
  declare id: string;
  declare userId?: string;
  declare vaccinationId?: string;
  declare antigenId?: string;
  declare isSuggested: boolean;
  declare monthOld: number;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

ImmunizationModel.init(
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
    vaccinationId: {
      type: DataTypes.UUID,
      field: 'vaccination_id',
      onDelete: 'CASCADE',
    },
    antigenId: {
      type: DataTypes.UUID,
      field: 'antigen_id',
      onDelete: 'CASCADE',
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    monthOld: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'month_old',
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
    tableName: 'immunization',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

ImmunizationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

VaccinationModel.hasMany(ImmunizationModel, {
  foreignKey: 'vaccinationId',
  as: 'immunization',
  onDelete: 'CASCADE',
  hooks: true,
});
ImmunizationModel.hasMany(ImmunizationScheduleModel, { foreignKey: 'immunization_id', as: 'schedule', onDelete: 'CASCADE', hooks: true });
ImmunizationScheduleModel.belongsTo(ImmunizationModel, { foreignKey: 'immunization_id', as: 'immunizations' });

export default ImmunizationModel;
