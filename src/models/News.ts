import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { NewsAttributes, NewsCategoryAttributes, NewsCreation } from '../interfaces/News';
import NewsCategoryModel from './NewsCategory';

class NewsModel extends Model<NewsAttributes | NewsCreation> {
  declare id: string;
  declare userId: string;
  declare title: string;
  declare author: string;
  declare coverPicture: string;
  declare content: string;
  declare isPublished: boolean;
  declare isDeleted: boolean;
  declare isPublic: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deleteAt?: Date;
  declare newsCategory?: NewsCategoryAttributes[];
}

NewsModel.init(
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
    title: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    coverPicture: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT({
        length: 'long',
      }),
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_published',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_public',
    },
    deletedAt: {
      type: DataTypes.DATE(),
      field: 'deleted_at',
    },
    publishAt: {
      type: DataTypes.DATE(),
      field: 'publish_at',
    },
  },
  {
    tableName: 'news',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

NewsModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

NewsModel.hasMany(NewsCategoryModel, { foreignKey: 'news_id', onDelete: 'CASCADE', hooks: true, as: 'newsCategory' });
NewsCategoryModel.belongsTo(NewsModel, { foreignKey: 'news_id', as: 'news' });

export default NewsModel;
