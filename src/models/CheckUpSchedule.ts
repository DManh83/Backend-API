import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { BabyBookAttributes } from '../interfaces/BabyBook';
import { CheckUpAttributes, CheckUpScheduleAttributes, CheckUpScheduleCreation } from '../interfaces/CheckUp';
import { UserAttributes } from '../interfaces/User';
import BabyBookModel from './BabyBook';

import UserModel from './User';

class CheckUpScheduleModel extends Model<CheckUpScheduleAttributes | CheckUpScheduleCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare checkUpVersionId: string;
  declare checkUpId: string;
  declare status?: string;
  declare isSuggested: boolean;
  declare dateDue: Date;
  declare dateDone?: Date;
  declare totalFile: number;
  declare notifyAt?: Date;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare userCheckUps?: UserAttributes;
  declare babyBookCheckUps?: BabyBookAttributes;
  declare checkUp?: CheckUpAttributes;
}

CheckUpScheduleModel.init(
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
      allowNull: false,
      onDelete: 'CASCADE',
    },
    checkUpVersionId: {
      type: DataTypes.UUID,
      field: 'check_up_version_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    checkUpId: {
      type: DataTypes.UUID,
      field: 'check_up_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(),
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    dateDue: {
      type: DataTypes.DATE(),
      field: 'date_due',
    },
    dateDone: {
      type: DataTypes.DATE(),
      field: 'date_done',
    },
    totalFile: {
      type: DataTypes.INTEGER(),
      field: 'total_file',
    },
    notifyAt: {
      type: DataTypes.DATE(),
      field: 'notify_at',
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
    tableName: 'check_up_schedule',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

CheckUpScheduleModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

UserModel.hasMany(CheckUpScheduleModel, { as: 'userCheckUps', foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
CheckUpScheduleModel.belongsTo(UserModel, { as: 'userCheckUps', foreignKey: 'userId' });
BabyBookModel.hasMany(CheckUpScheduleModel, { as: 'babyBookCheckUps', foreignKey: 'babyBookId', onDelete: 'CASCADE', hooks: true });
CheckUpScheduleModel.belongsTo(BabyBookModel, { as: 'babyBookCheckUps', foreignKey: 'babyBookId' });

export default CheckUpScheduleModel;
