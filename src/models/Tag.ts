import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { TagAttributes, TagCreation } from '../interfaces/Note';

class TagModel extends Model<TagAttributes | TagCreation> {
  declare id: string;
  declare userId?: string;
  declare name: string;
  declare type: number;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

TagModel.init(
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
    name: {
      type: DataTypes.STRING(),
    },
    type: {
      type: DataTypes.INTEGER(),
      defaultValue: 0,
      allowNull: false,
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
    tableName: 'tag',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

TagModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default TagModel;
