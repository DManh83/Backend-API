import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { BabyBookAttributes } from '../interfaces/BabyBook';
import { ImmunizationAttributes, ImmunizationScheduleAttributes, ImmunizationScheduleCreation } from '../interfaces/Immunization';
import { UserAttributes } from '../interfaces/User';
import BabyBookModel from './BabyBook';
import UserModel from './User';

class ImmunizationScheduleModel extends Model<ImmunizationScheduleAttributes | ImmunizationScheduleCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare vaccinationId: string;
  declare immunizationId: string;
  declare dateDue: Date;
  declare batchNo?: string;
  declare status?: string;
  declare organization?: string;
  declare isSuggested: boolean;
  declare isCompleted: boolean;
  declare dateDone?: Date;
  declare repeatShotAt?: Date;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare userImmunization?: UserAttributes;
  declare babyBookImmunization?: BabyBookAttributes;
  declare immunizations?: ImmunizationAttributes;
}

ImmunizationScheduleModel.init(
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
    vaccinationId: {
      type: DataTypes.UUID,
      field: 'vaccination_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    immunizationId: {
      type: DataTypes.UUID,
      field: 'immunization_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    dateDue: {
      type: DataTypes.DATE(),
      field: 'date_due',
      allowNull: false,
    },
    batchNo: {
      type: DataTypes.STRING(),
      field: 'batch_no',
    },
    status: {
      type: DataTypes.STRING(),
    },
    organization: {
      type: DataTypes.STRING(),
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_completed',
    },
    dateDone: {
      type: DataTypes.DATE(),
      field: 'date_done',
    },
    repeatShotAt: {
      type: DataTypes.DATE(),
      field: 'repeat_shot_at',
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
    tableName: 'immunization_schedule',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

UserModel.hasMany(ImmunizationScheduleModel, { as: 'userImmunization', foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
ImmunizationScheduleModel.belongsTo(UserModel, { as: 'userImmunization', foreignKey: 'userId' });
BabyBookModel.hasMany(ImmunizationScheduleModel, {
  as: 'babyBookImmunization',
  foreignKey: 'babyBookId',
  onDelete: 'CASCADE',
  hooks: true,
});
ImmunizationScheduleModel.belongsTo(BabyBookModel, { as: 'babyBookImmunization', foreignKey: 'babyBookId' });

ImmunizationScheduleModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default ImmunizationScheduleModel;
