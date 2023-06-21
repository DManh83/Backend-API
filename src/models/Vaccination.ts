import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelize from '../common/lib/Sequelize';
import { VaccinationAttributes, VaccinationCreation } from '../interfaces/Immunization';

class VaccinationModel extends Model<VaccinationAttributes | VaccinationCreation> {
  declare id: string;
  declare userId?: string;
  declare babyBookId?: string;
  declare mainColor?: string;
  declare subColor?: string;
  declare name: string;
  declare country: string;
  declare isSuggested: boolean;
  declare totalImmunization: number;
  declare isDeleted: boolean;
  declare deletedAt?: Date;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare isReleased?: boolean;
  declare code?: string;
  declare year?: number;
  declare tooltip?: string;
  declare medicalCondition?: boolean;
  declare indigenous?: boolean;
}

VaccinationModel.init(
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
      field: 'baby_book_id',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(),
    },
    mainColor: {
      type: DataTypes.STRING(),
      field: 'main_color',
    },
    subColor: {
      type: DataTypes.STRING(),
      field: 'sub_color',
    },
    isSuggested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_suggested',
    },
    totalImmunization: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      field: 'total_immunization',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted',
    },
    deletedAt: {
      type: DataTypes.DATE(),
      field: 'deleted_at',
    },
    isReleased: {
      type: DataTypes.BOOLEAN,
      field: 'is_released',
    },
    code: {
      type: DataTypes.STRING(),
    },
    year: {
      type: DataTypes.INTEGER(),
    },
    tooltip: {
      type: DataTypes.TEXT({
        length: 'long',
      }),
    },
    indigenous: {
      type: DataTypes.BOOLEAN,
    },
    medicalCondition: {
      type: DataTypes.BOOLEAN,
      field: 'medical_condition',
    },
  },
  {
    tableName: 'vaccination',
    underscored: true,
    freezeTableName: true,
    sequelize,
  }
);

VaccinationModel.beforeCreate((instance) => {
  instance.id = uuidv4();
});

export default VaccinationModel;
