import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { MilestoneAlbumAttributes, MilestoneAttributes, MilestoneBehaviorAttributes, MilestoneCreation } from '../interfaces/Milestone';
import MilestoneAlbumModel from './MilestoneAlbum';
import MilestoneStandardBehaviorModel from './MilestoneStandardBehavior';

class MilestoneModel extends Model<MilestoneAttributes | MilestoneCreation> {
  declare id: string;
  declare albumId: string;
  declare behaviorId?: string;
  declare isDeleted: boolean;
  declare totalPhoto: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare behavior?: MilestoneBehaviorAttributes;
  declare album?: MilestoneAlbumAttributes;
}

MilestoneModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    albumId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'album_id',
      onDelete: 'CASCADE',
    },
    behaviorId: {
      type: DataTypes.UUID,
      field: 'behavior_id',
      onDelete: 'CASCADE',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_deleted',
      defaultValue: false,
    },
    totalPhoto: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_photo',
    },
  },
  {
    tableName: 'milestone',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestoneModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

MilestoneModel.beforeUpdate((instance) => {});

MilestoneModel.belongsTo(MilestoneStandardBehaviorModel, { foreignKey: 'behaviorId', as: 'behavior' });
MilestoneStandardBehaviorModel.hasMany(MilestoneModel, { foreignKey: 'behaviorId', onDelete: 'CASCADE', hooks: true });

MilestoneModel.belongsTo(MilestoneAlbumModel, { foreignKey: 'albumId', as: 'album' });
MilestoneAlbumModel.hasMany(MilestoneModel, { foreignKey: 'albumId', onDelete: 'CASCADE', hooks: true });

export default MilestoneModel;
