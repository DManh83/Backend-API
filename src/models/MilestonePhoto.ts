import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { MilestonePhotoAttributes, MilestonePhotoCreation } from '../interfaces/Milestone';
import MilestoneAlbumModel from './MilestoneAlbum';

class MilestonePhotoModel extends Model<MilestonePhotoAttributes | MilestonePhotoCreation> {
  declare id: string;
  declare milestoneId: string;
  declare userId: string;
  declare milestoneAlbumId: string;
  declare babyBookId: string;
  declare photo: string;
  declare caption: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare fileSize: number;
}

MilestonePhotoModel.init(
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
    milestoneId: {
      type: DataTypes.UUID,
      field: 'milestone_id',
      onDelete: 'CASCADE',
    },
    milestoneAlbumId: {
      type: DataTypes.UUID,
      field: 'milestone_album_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    photo: {
      type: DataTypes.STRING(200),
    },
    caption: {
      type: DataTypes.STRING(255),
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_deleted',
      defaultValue: false,
    },
    fileSize: {
      type: DataTypes.INTEGER(),
      defaultValue: 0,
      allowNull: false,
      field: 'file_size',
    },
  },
  {
    tableName: 'milestone_photo',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestonePhotoModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  if (instance.caption) {
    instance.caption = instance.caption.trim();
  }
});

MilestonePhotoModel.beforeUpdate((instance) => {
  if (instance.caption) {
    instance.caption = instance.caption.trim();
  }
});

MilestonePhotoModel.belongsTo(MilestoneAlbumModel, { foreignKey: 'milestoneAlbumId', as: 'album' });
MilestoneAlbumModel.hasMany(MilestonePhotoModel, { foreignKey: 'milestoneAlbumId', onDelete: 'CASCADE', hooks: true });

export default MilestonePhotoModel;
