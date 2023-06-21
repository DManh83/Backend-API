import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { BabyBookAttributes, BabyBookCreation } from '../interfaces/BabyBook';
import UserModel from '../models/User';

class BabyBookModel extends Model<BabyBookAttributes | BabyBookCreation> {
  declare id: string;
  declare userId: string;
  declare name: string;
  declare photo?: string;
  declare birthday: Date;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare indigenous?: boolean;
  declare medicalCondition?: boolean;
}

BabyBookModel.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(200),
    },
    birthday: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    indigenous: {
      type: DataTypes.BOOLEAN,
    },
    medicalCondition: {
      type: DataTypes.BOOLEAN,
      field: 'medical_condition',
    },
  },
  {
    tableName: 'baby_book',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

BabyBookModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

BabyBookModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'creator' });
UserModel.hasMany(BabyBookModel, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });

export default BabyBookModel;
