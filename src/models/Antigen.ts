import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { AntigenAttributes, AntigenCreation } from '../interfaces/Immunization';
import ImmunizationAntigenModel from './ImmunizationAntigen';

class AntigenModel extends Model<AntigenAttributes | AntigenCreation> {
  declare id: string;
  declare userId?: string;
  declare name: string;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

AntigenModel.init(
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
    name: {
      type: DataTypes.STRING(),
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
    tableName: 'antigen',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

ImmunizationAntigenModel.belongsTo(AntigenModel, { foreignKey: 'antigen_id', as: 'antigen' });
AntigenModel.hasMany(ImmunizationAntigenModel, { foreignKey: 'antigen_id', onDelete: 'CASCADE', hooks: true });

AntigenModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default AntigenModel;
