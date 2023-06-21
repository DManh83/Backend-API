import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../common/lib/Sequelize';
import { DeviceAttributes, DeviceCreation } from '../interfaces/DevicesKey';

class DeviceModel extends Model<DeviceAttributes | DeviceCreation> {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

DeviceModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    token: {
      type: DataTypes.UUID,
    },
  },
  {
    tableName: 'device',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

DeviceModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default DeviceModel;
