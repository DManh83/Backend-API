import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { CheckUpVersionAttributes, CheckUpVersionCreation } from '../interfaces/CheckUp';

class CheckUpVersionModel extends Model<CheckUpVersionAttributes | CheckUpVersionCreation> {
  declare id: string;
  declare userId?: string;
  declare babyBookId?: string;
  declare mainColor?: string;
  declare subColor?: string;
  declare name: string;
  declare source: string;
  declare version: string;
  declare isSuggested: boolean;
  declare totalCheckUp: number;
  declare isDeleted: boolean;
  declare year?: number;
  declare isReleased?: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

CheckUpVersionModel.init(
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
    name: {
      type: DataTypes.STRING(),
    },
    source: {
      type: DataTypes.STRING(),
    },
    version: {
      type: DataTypes.STRING(),
    },
    mainColor: {
      type: DataTypes.STRING(),
      field: 'main_color',
    },
    subColor: {
      type: DataTypes.STRING(),
      field: 'sub_color',
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    year: {
      type: DataTypes.INTEGER(),
    },
    isReleased: {
      type: DataTypes.BOOLEAN,
      field: 'is_released',
    },
    totalCheckUp: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_check_up',
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
    tableName: 'check_up_version',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

CheckUpVersionModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default CheckUpVersionModel;
