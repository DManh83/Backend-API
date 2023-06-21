import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { UserCheckUpVersionAttributes, UserCheckUpVersionCreation } from '../interfaces/CheckUp';

import CheckUpVersionModel from './CheckUpVersion';

class UserCheckUpVersionModel extends Model<UserCheckUpVersionAttributes | UserCheckUpVersionCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare checkUpVersionId: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

UserCheckUpVersionModel.init(
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
    checkUpVersionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'check_up_version_id',
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
    tableName: 'user_check_up_version',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

UserCheckUpVersionModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

UserCheckUpVersionModel.belongsTo(CheckUpVersionModel, { foreignKey: 'check_up_version_id', as: 'version' });
CheckUpVersionModel.hasMany(UserCheckUpVersionModel, { foreignKey: 'check_up_version_id', onDelete: 'CASCADE', hooks: true });

export default UserCheckUpVersionModel;
