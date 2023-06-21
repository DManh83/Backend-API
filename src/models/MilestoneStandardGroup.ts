import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../common/lib/Sequelize';
import { MilestoneGroupAttributes, MilestoneGroupCreation } from '../interfaces/Milestone';

class MilestoneStandardGroupModel extends Model<MilestoneGroupAttributes | MilestoneGroupCreation> {
  declare id: string;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

MilestoneStandardGroupModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'milestone_standard_group',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestoneStandardGroupModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  instance.name = instance.name.trim();
});

MilestoneStandardGroupModel.beforeUpdate((instance) => {
  instance.name = instance.name.trim();
});

export default MilestoneStandardGroupModel;
