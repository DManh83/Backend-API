import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NewsReleasedAttributes, NewsReleasedCreation } from '../interfaces/News';

class NewsReleasedModel extends Model<NewsReleasedAttributes | NewsReleasedCreation> {
  declare id: string;
  declare newsId: string;
  declare userId: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

NewsReleasedModel.init(
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
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
  },
  {
    tableName: 'news_released',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NewsReleasedModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default NewsReleasedModel;
