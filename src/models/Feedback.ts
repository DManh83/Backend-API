import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { FeedbackAttributes, FeedbackCreation } from '../interfaces/Feedback';

class FeedbackModel extends Model<FeedbackAttributes | FeedbackCreation> {
  declare id: string;
  declare email: string;
  declare reason: string;
  declare feedback: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

FeedbackModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(),
      field: 'email',
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    feedback: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
  },
  {
    tableName: 'feedback',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

FeedbackModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default FeedbackModel;
