import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { ImmunizationAntigenAttributes, ImmunizationAntigenCreation } from '../interfaces/Immunization';
import ImmunizationModel from './Immunization';

class ImmunizationAntigenModel extends Model<ImmunizationAntigenAttributes | ImmunizationAntigenCreation> {
  declare id: string;
  declare immunizationId: string;
  declare antigenId: string;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

ImmunizationAntigenModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    immunizationId: {
      type: DataTypes.UUID,
      field: 'immunization_id',
      onDelete: 'CASCADE',
    },
    antigenId: {
      type: DataTypes.UUID,
      field: 'antigen_id',
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
    tableName: 'immunization_antigen',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

ImmunizationModel.hasMany(ImmunizationAntigenModel, {
  foreignKey: 'immunizationId',
  as: 'immunizationAntigen',
  onDelete: 'CASCADE',
  hooks: true,
});

ImmunizationAntigenModel.belongsTo(ImmunizationModel, {
  foreignKey: 'immunizationId',
  as: 'immunizationAntigen',
});

ImmunizationAntigenModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default ImmunizationAntigenModel;
