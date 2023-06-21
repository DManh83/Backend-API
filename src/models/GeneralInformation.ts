import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../common/lib/Sequelize';
import { Sex } from '../common/enum';
import UserModel from '../models/User';
import BabyBookModel from '../models/BabyBook';

class GeneralInformationModel extends Model {
  declare id: string;
  declare userId: string;
  declare babyBookId: string;
  declare lastName: string;
  declare givenName: string;
  declare address: string;
  declare birthday: Date;
  declare sex: Sex;
  declare birthWeight: number;
  declare birthtime: string;
  declare language: string;
  declare totalSibling: number;
  declare mother: string;
  declare motherPhone: string;
  declare motherWorkPhone: string;
  declare motherEmail: string;
  declare father: string;
  declare fatherPhone: string;
  declare fatherWorkPhone: string;
  declare fatherEmail: string;
  declare insuranceNumber: string;
  declare insuranceFirstName: string;
  declare insuranceSurname: string;
  declare insuranceBirthday: Date;
  declare insuranceAddress: string;
  declare insurerName: string;
  declare idSticker: string;
  declare practitioner: string;
  declare practitionerPhone: string;
  declare hospital: string;
  declare hospitalPhone: string;
  declare nurse: string;
  declare nursePhone: string;
  declare dentist: string;
  declare dentistPhone: string;
  declare pediatrician: string;
  declare pediatricianPhone: string;
  declare other: string;
  declare otherPhone: string;
  declare isDeleted: boolean;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

GeneralInformationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      onDelete: 'CASCADE',
    },
    babyBookId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    lastName: {
      type: DataTypes.STRING(50),
      field: 'last_name',
    },
    givenName: {
      type: DataTypes.STRING(50),
      field: 'given_name',
    },
    address: {
      type: DataTypes.STRING(200),
    },
    birthday: {
      type: DataTypes.DATE,
    },
    sex: {
      type: DataTypes.ENUM('male', 'female'),
    },
    birthWeight: {
      type: DataTypes.FLOAT(6),
      field: 'birth_weight',
    },
    birthtime: {
      type: DataTypes.STRING(10),
    },
    language: {
      type: DataTypes.STRING(20),
    },
    totalSibling: {
      type: DataTypes.INTEGER(),
      field: 'total_sibling',
    },
    mother: {
      type: DataTypes.STRING(50),
      field: 'mother',
    },
    motherPhone: {
      type: DataTypes.STRING(20),
      field: 'mother_phone',
    },
    motherWorkPhone: {
      type: DataTypes.STRING(20),
      field: 'mother_work_phone',
    },
    motherEmail: {
      type: DataTypes.STRING(50),
      field: 'mother_email',
    },
    father: {
      type: DataTypes.STRING(50),
      field: 'father',
    },
    fatherPhone: {
      type: DataTypes.STRING(20),
      field: 'father_phone',
    },
    fatherWorkPhone: {
      type: DataTypes.STRING(20),
      field: 'father_work_phone',
    },
    fatherEmail: {
      type: DataTypes.STRING(50),
      field: 'father_email',
    },
    insuranceNumber: {
      type: DataTypes.STRING(200),
      field: 'insurance_number',
    },
    insuranceFirstName: {
      type: DataTypes.STRING(50),
      field: 'insurance_first_name',
    },
    insuranceSurname: {
      type: DataTypes.STRING(50),
      field: 'insurance_surname',
    },
    insuranceBirthday: {
      type: DataTypes.DATE,
      field: 'insurance_birthday',
    },
    insuranceAddress: {
      type: DataTypes.STRING(200),
      field: 'insurance_address',
    },
    insurerName: {
      type: DataTypes.STRING(200),
      field: 'insurer_name',
    },
    idSticker: {
      type: DataTypes.STRING(200),
      field: 'id_sticker',
    },
    practitioner: {
      type: DataTypes.STRING(50),
    },
    practitionerPhone: {
      type: DataTypes.STRING(20),
      field: 'practitioner_phone',
    },
    hospital: {
      type: DataTypes.STRING(200),
    },
    hospitalPhone: {
      type: DataTypes.STRING(20),
      field: 'hospital_phone',
    },
    nurse: {
      type: DataTypes.STRING(50),
    },
    nursePhone: {
      type: DataTypes.STRING(20),
      field: 'nurse_phone',
    },
    dentist: {
      type: DataTypes.STRING(50),
    },
    dentistPhone: {
      type: DataTypes.STRING(20),
      field: 'dentist_phone',
    },
    pediatrician: {
      type: DataTypes.STRING(50),
    },
    pediatricianPhone: {
      type: DataTypes.STRING(20),
      field: 'pediatrician_phone',
    },
    other: {
      type: DataTypes.STRING(200),
    },
    otherPhone: {
      type: DataTypes.STRING(20),
      field: 'other_phone',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
  },
  {
    tableName: 'general_information',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

GeneralInformationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

GeneralInformationModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'creator' });
UserModel.hasMany(GeneralInformationModel, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });

GeneralInformationModel.belongsTo(BabyBookModel, { foreignKey: 'babyBookId', as: 'babyBook' });
BabyBookModel.hasMany(GeneralInformationModel, { foreignKey: 'babyBookId', onDelete: 'CASCADE', hooks: true });

export default GeneralInformationModel;
