import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { MilestoneBehaviorAttributes, MilestoneBehaviorCreation } from '../interfaces/Milestone';
import MilestoneStandardAgeModel from './MilestoneStandardAge';
import MilestoneStandardGroupModel from './MilestoneStandardGroup';

class MilestoneStandardBehaviorModel extends Model<MilestoneBehaviorAttributes | MilestoneBehaviorCreation> {
  declare id: string;
  declare groupId: string;
  declare ageId: string;
  declare behavior: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare age?: MilestoneStandardAgeModel;
}

MilestoneStandardBehaviorModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id',
      onDelete: 'CASCADE',
    },
    ageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'age_id',
      onDelete: 'CASCADE',
    },
    behavior: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'milestone_standard_behavior',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestoneStandardBehaviorModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  instance.behavior = instance.behavior.trim();
});

MilestoneStandardBehaviorModel.beforeUpdate((instance) => {
  instance.behavior = instance.behavior.trim();
});

MilestoneStandardBehaviorModel.belongsTo(MilestoneStandardAgeModel, { foreignKey: 'ageId', as: 'age' });
MilestoneStandardAgeModel.hasMany(MilestoneStandardBehaviorModel, {
  foreignKey: 'ageId',
  as: 'behavior',
  onDelete: 'CASCADE',
  hooks: true,
});

MilestoneStandardBehaviorModel.belongsTo(MilestoneStandardGroupModel, { foreignKey: 'groupId', as: 'group' });
MilestoneStandardGroupModel.hasMany(MilestoneStandardBehaviorModel, { foreignKey: 'groupId', onDelete: 'CASCADE', hooks: true });

export default MilestoneStandardBehaviorModel;
