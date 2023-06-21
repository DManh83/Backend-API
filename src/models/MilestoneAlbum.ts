import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { MilestoneAlbumAttributes, MilestoneAlbumCreation } from '../interfaces/Milestone';

class MilestoneAlbumModel extends Model<MilestoneAlbumAttributes | MilestoneAlbumCreation> {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare isStandard: boolean;
  declare name: string;
  declare thumbnail: string;
  declare isDeleted: boolean;
  declare totalMilestone: number;
  declare totalPhoto: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

MilestoneAlbumModel.init(
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
    babyBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    isStandard: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_standard',
      defaultValue: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(200),
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_deleted',
      defaultValue: false,
    },
    totalMilestone: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_milestone',
    },
    totalPhoto: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_photo',
    },
  },
  {
    tableName: 'milestone_album',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestoneAlbumModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  instance.name = instance.name.trim();
});

MilestoneAlbumModel.beforeUpdate((instance) => {
  instance.name = instance.name.trim();
});

export default MilestoneAlbumModel;
