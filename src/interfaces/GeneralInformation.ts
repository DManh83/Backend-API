import { Sex } from '../common/enum';

export interface GeneralInformationAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  lastName?: string;
  givenName?: string;
  address?: string;
  birthday: Date;
  sex?: Sex;
  birthWeight?: number;
  birthtime?: string;
  language?: string;
  totalSibling?: number;
  mother?: string;
  motherPhone?: string;
  motherWorkPhone?: string;
  motherEmail?: string;
  father?: string;
  fatherPhone?: string;
  fatherWorkPhone?: string;
  fatherEmail?: string;
  insuranceNumber?: string;
  insuranceFirstName?: string;
  insuranceSurname?: string;
  insuranceBirthday?: Date;
  insuranceAddress?: string;
  insurerName?: string;
  idSticker?: string;
  practitioner?: string;
  practitionerPhone?: string;
  hospital?: string;
  hospitalPhone?: string;
  nurse?: string;
  nursePhone?: string;
  dentist?: string;
  dentistPhone?: string;
  pediatrician?: string;
  pediatricianPhone?: string;
  other?: string;
  otherPhone?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GeneralInformationCreation = Omit<GeneralInformationAttributes, 'id'>;

export interface UpdateBirthdayParams {
  babyBookId: string;
  birthday: Date;
  deleteRelatedRecord: boolean;
}

export interface updateGeneralInformationParams {
  babyBookId: string;
  lastName: string;
  givenName: string;
  address?: string;
  sex?: Sex;
  birthWeight?: number;
  birthtime?: string;
  language?: string;
  totalSibling?: number;
  mother?: string;
  motherPhone?: string;
  motherWorkPhone?: string;
  motherEmail?: string;
  father?: string;
  fatherPhone?: string;
  fatherWorkPhone?: string;
  fatherEmail?: string;
  insuranceNumber?: string;
  insuranceFirstName?: string;
  insuranceSurname?: string;
  insuranceBirthday?: Date;
  insuranceAddress?: string;
  insurerName?: string;
  idSticker?: string;
  practitioner?: string;
  practitionerPhone?: string;
  hospital?: string;
  hospitalPhone?: string;
  nurse?: string;
  nursePhone?: string;
  dentist?: string;
  dentistPhone?: string;
  pediatrician?: string;
  pediatricianPhone?: string;
  other?: string;
  otherPhone?: string;
  fileName?: string;
}
