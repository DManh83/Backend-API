import imageStore from '../common/helpers/imageStore';
import { GeneralInformationAttributes } from '../interfaces/GeneralInformation';

export const generalInformationSerializer = (generalInformation: GeneralInformationAttributes) => ({
  id: generalInformation.id,
  babyBookId: generalInformation.babyBookId,
  lastName: generalInformation.lastName,
  givenName: generalInformation.givenName,
  address: generalInformation.address,
  birthday: generalInformation.birthday,
  sex: generalInformation.sex,
  birthWeight: generalInformation.birthWeight,
  birthtime: generalInformation.birthtime,
  language: generalInformation.language,
  totalSibling: generalInformation.totalSibling,
  mother: generalInformation.mother,
  motherPhone: generalInformation.motherPhone,
  motherWorkPhone: generalInformation.motherWorkPhone,
  motherEmail: generalInformation.motherEmail,
  father: generalInformation.father,
  fatherPhone: generalInformation.fatherPhone,
  fatherWorkPhone: generalInformation.fatherWorkPhone,
  fatherEmail: generalInformation.fatherEmail,
  insuranceNumber: generalInformation.insuranceNumber,
  insuranceFirstName: generalInformation.insuranceFirstName,
  insuranceSurname: generalInformation.insuranceSurname,
  insuranceBirthday: generalInformation.insuranceBirthday,
  insuranceAddress: generalInformation.insuranceAddress,
  insurerName: generalInformation.insurerName,
  idSticker: imageStore.getUrl(generalInformation.userId, generalInformation.idSticker),
  practitioner: generalInformation.practitioner,
  practitionerPhone: generalInformation.practitionerPhone,
  hospital: generalInformation.hospital,
  hospitalPhone: generalInformation.hospitalPhone,
  nurse: generalInformation.nurse,
  nursePhone: generalInformation.nursePhone,
  dentist: generalInformation.dentist,
  dentistPhone: generalInformation.dentistPhone,
  pediatrician: generalInformation.pediatrician,
  pediatricianPhone: generalInformation.pediatricianPhone,
  other: generalInformation.other,
  otherPhone: generalInformation.otherPhone,
  isDeleted: generalInformation.isDeleted,
  createdAt: generalInformation.createdAt,
  updatedAt: generalInformation.updatedAt,
});
