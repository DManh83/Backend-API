import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { Sex, UserRole } from '../common/enum';
import sequelize from '../common/lib/Sequelize';
import { SubScriptionAttributes } from '../interfaces/Subscription';
import { UserAttributes, UserCreation } from '../interfaces/User';

class UserModel extends Model<UserAttributes | UserCreation> {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare password: string;
  declare otpSecret: string;
  declare phone: string;
  declare countryCode: string;
  declare birthday?: Date;
  declare workPhone?: string;
  declare streetAddress?: string;
  declare cityTown?: string;
  declare stateProvince?: string;
  declare postalCode?: string;
  declare sex?: Sex;
  declare sessionExpire?: number;
  declare avatar?: string;
  declare passwordUpdateAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare totalBabyBook?: number;
  declare role?: UserRole;
  declare checkUpsNotify?: boolean;
  declare customCheckUpsNotify?: boolean;
  declare customImmunizationsNotify?: boolean;
  declare immunizationsNotify?: boolean;
  declare generalInformationNotify?: boolean;
  declare inactivityNotify?: boolean;
  declare stripeCustomerId?: string;
  declare paymentMethod?: Object;
  declare subscription?: SubScriptionAttributes;
  declare usedStorage?: number;
  declare seenSharingGuide?: boolean;
  declare pushNotify?: boolean;
  declare receiveMail?: boolean;
  declare subscribeNewsletter?: boolean;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    otpSecret: {
      type: DataTypes.STRING(21),
      field: 'otp_secret',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    countryCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: 'country_code',
    },
    totalBabyBook: {
      type: DataTypes.INTEGER(),
      defaultValue: 0,
      allowNull: false,
      field: 'total_baby_book',
    },
    role: {
      type: DataTypes.ENUM(UserRole.ADMIN, UserRole.EDITOR, UserRole.MEMBER),
    },
    birthday: {
      type: DataTypes.DATE,
      field: 'birthday',
    },
    workPhone: {
      type: DataTypes.STRING,
      field: 'work_phone',
    },
    streetAddress: {
      type: DataTypes.STRING,
      field: 'street_address',
    },
    cityTown: {
      type: DataTypes.STRING,
      field: 'city_town',
    },
    stateProvince: {
      type: DataTypes.STRING,
      field: 'state_province',
    },
    postalCode: {
      type: DataTypes.STRING,
      field: 'postal_code',
    },
    sex: {
      type: DataTypes.ENUM('male', 'female'),
    },
    avatar: {
      type: DataTypes.STRING,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      field: 'stripe_customer_id',
    },
    paymentMethod: {
      type: DataTypes.JSONB,
      field: 'payment_method',
    },
    sessionExpire: {
      type: DataTypes.INTEGER,
      field: 'session_expire',
    },
    usedStorage: {
      type: DataTypes.INTEGER,
      field: 'used_storage',
    },
    passwordUpdateAt: {
      type: DataTypes.DATE,
      field: 'password_update_at',
    },
    checkUpsNotify: {
      type: DataTypes.BOOLEAN,
      field: 'check_ups_notify',
    },
    customCheckUpsNotify: {
      type: DataTypes.BOOLEAN,
      field: 'custom_check_ups_notify',
    },
    customImmunizationsNotify: {
      type: DataTypes.BOOLEAN,
      field: 'custom_immunizations_notify',
    },
    immunizationsNotify: {
      type: DataTypes.BOOLEAN,
      field: 'immunizations_notify',
    },
    generalInformationNotify: {
      type: DataTypes.BOOLEAN,
      field: 'general_information_notify',
    },
    inactivityNotify: {
      type: DataTypes.BOOLEAN,
      field: 'inactivity_notify',
    },
    seenSharingGuide: {
      type: DataTypes.BOOLEAN,
      field: 'seen_sharing_guide',
    },
    pushNotify: {
      type: DataTypes.BOOLEAN,
      field: 'push_notify',
    },
    receiveMail: {
      type: DataTypes.BOOLEAN,
      field: 'receive_mail',
    },
    subscribeNewsletter: {
      type: DataTypes.BOOLEAN,
      field: 'subscribe_newsletter',
    },
  },
  {
    tableName: 'user',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

UserModel.beforeCreate((instance) => {
  instance.id = uuidv4();
  instance.email = instance.email.toLowerCase().trim();
  instance.sessionExpire = 48;
});

UserModel.beforeUpdate((instance) => {
  instance.email = instance.email.toLowerCase().trim();
});

export default UserModel;
