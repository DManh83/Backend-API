import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { VerificationType } from '../common/enum';
import sequelize from '../common/lib/Sequelize';
import { VerificationAttributes } from '../interfaces/Verification';
import UserModel from './User';

class VerificationModel extends Model<VerificationAttributes> {
  declare id: string;
  declare userId: string;
  declare type: VerificationType;
  declare isVerified: boolean;
  declare isDefault: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

VerificationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('email', 'sms'),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_verified',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_default',
    },
  },
  {
    tableName: 'verification',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

VerificationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

VerificationModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'creator' });
UserModel.hasMany(VerificationModel, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });

export default VerificationModel;
