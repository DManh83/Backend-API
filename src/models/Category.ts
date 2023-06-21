import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { CategoryAttributes, CategoryCreation } from '../interfaces/News';

class CategoryModel extends Model<CategoryAttributes | CategoryCreation> {
  declare id: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

CategoryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
  },
  {
    tableName: 'category',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

CategoryModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default CategoryModel;
