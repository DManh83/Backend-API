import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { CategoryAttributes, UserCategoryAttributes, UserCategoryCreation } from '../interfaces/News';
import CategoryModel from './Category';
import UserModel from './User';

class UserCategoryModel extends Model<UserCategoryAttributes | UserCategoryCreation> {
  declare id: string;
  declare userId: string;
  declare categoryId: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare category?: CategoryAttributes;
}

UserCategoryModel.init(
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'user_category',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

UserCategoryModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

UserModel.hasMany(UserCategoryModel, { foreignKey: 'user_id', onDelete: 'CASCADE', hooks: true, as: 'userCategory' });
UserCategoryModel.belongsTo(CategoryModel, { foreignKey: 'category_id', as: 'category' });
CategoryModel.hasMany(UserCategoryModel, { foreignKey: 'category_id', onDelete: 'CASCADE', hooks: true });

export default UserCategoryModel;
