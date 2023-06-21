import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NewsCategoryAttributes, NewsCategoryCreation } from '../interfaces/News';
import CategoryModel from './Category';

class NewsCategoryModel extends Model<NewsCategoryAttributes | NewsCategoryCreation> {
  declare id: string;
  declare newsId: string;
  declare categoryId: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

NewsCategoryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    newsId: {
      type: DataTypes.UUID,
      field: 'news_id',
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
    tableName: 'news_category',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NewsCategoryModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

NewsCategoryModel.belongsTo(CategoryModel, { foreignKey: 'category_id', as: 'category' });
CategoryModel.hasMany(NewsCategoryModel, { foreignKey: 'category_id', onDelete: 'CASCADE', hooks: true });

export default NewsCategoryModel;
