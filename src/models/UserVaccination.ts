import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { UserVaccinationAttributes, UserVaccinationCreation } from '../interfaces/Immunization';
import VaccinationModel from './Vaccination';

class UserVaccinationModel extends Model<UserVaccinationAttributes | UserVaccinationCreation> {
  declare id: string;
  declare userId: string;
  declare vaccinationId: string;
  declare babyBookId: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

UserVaccinationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    babyBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    vaccinationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'vaccination_id',
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
    tableName: 'user_vaccination',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

UserVaccinationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

UserVaccinationModel.belongsTo(VaccinationModel, { foreignKey: 'vaccination_id', as: 'vaccination' });
VaccinationModel.hasMany(UserVaccinationModel, { foreignKey: 'vaccination_id', onDelete: 'CASCADE', hooks: true });

export default UserVaccinationModel;
