import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { SubScriptionAttributes, SubscriptionCreation, SubscriptionStatus } from '../interfaces/Subscription';
import sequelize from '../common/lib/Sequelize';
import UserModel from './User';

class SubscriptionModel extends Model<SubScriptionAttributes | SubscriptionCreation> {
  declare id: string;
  declare userId: string;
  declare subscriptionId: string;
  declare status: SubscriptionStatus;
  declare currentPeriodStart: Date;
  declare currentPeriodEnd: Date;
  declare cancelAtPeriodEnd: boolean;
  declare record: any;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

SubscriptionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      field: 'subscription_id',
    },
    status: {
      type: DataTypes.ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'),
      allowNull: false,
    },
    currentPeriodStart: {
      allowNull: false,
      type: DataTypes.DATE,
      field: 'current_period_start',
    },
    currentPeriodEnd: {
      allowNull: false,
      type: DataTypes.DATE,
      field: 'current_period_end',
    },
    cancelAtPeriodEnd: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
      field: 'cancel_at_period_end',
    },
    record: {
      type: DataTypes.JSONB,
    },
  },
  { tableName: 'subscription', underscored: true, freezeTableName: true, sequelize }
);

SubscriptionModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

SubscriptionModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'subscription', hooks: true });
UserModel.hasOne(SubscriptionModel, { foreignKey: 'userId', as: 'subscription', onDelete: 'CASCADE', hooks: true });

export default SubscriptionModel;
