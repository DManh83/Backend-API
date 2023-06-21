import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { MilestoneAgeAttributes, MilestoneAgeCreation } from '../interfaces/Milestone';

class MilestoneStandardAgeModel extends Model<MilestoneAgeAttributes | MilestoneAgeCreation> {
  declare id: string;
  declare day: number;
  declare month: number;
  declare year: number;
  declare subject: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

MilestoneStandardAgeModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'milestone_standard_age',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

MilestoneStandardAgeModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  instance.subject = instance.subject.trim();
});

MilestoneStandardAgeModel.beforeUpdate((instance) => {
  instance.subject = instance.subject.trim();
});

export default MilestoneStandardAgeModel;
