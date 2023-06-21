import { AntigenAttributes, ImmunizationAttributes, UserVaccinationAttributes, VaccinationAttributes } from '../interfaces/Immunization';

export const vaccinationSerializer = (vaccination: VaccinationAttributes) => ({
  id: vaccination.id,
  name: vaccination.name,
  country: vaccination.country,
  isSuggested: vaccination.isSuggested,
  totalImmunization: vaccination.totalImmunization,
  mainColor: vaccination.mainColor,
  subColor: vaccination.subColor,
  isDeleted: vaccination.isDeleted,
  createdAt: vaccination.createdAt,
  updatedAt: vaccination.updatedAt,
  babyBookId: vaccination.babyBookId,
  isReleased: vaccination.isReleased,
  tooltip: vaccination.tooltip,
  indigenous: vaccination.indigenous,
  medicalCondition: vaccination.medicalCondition,
  code: vaccination.code,
  year: vaccination.year,
  immunizations: vaccination.immunization?.map(immunizationSerializer),
});

export const userVaccinationSerializer = (userVaccination: UserVaccinationAttributes) => ({
  id: userVaccination.id,
  vaccinationId: userVaccination.vaccinationId,
  vaccination: userVaccination.vaccination || null,
});

export const antigenSerializer = (antigen: AntigenAttributes) => ({
  id: antigen.id,
  userId: antigen.userId,
  name: antigen.name,
  createdAt: antigen.createdAt,
  updatedAt: antigen.updatedAt,
});

export const immunizationSerializer = (immunization: ImmunizationAttributes) => {
  let serializedData: any = {
    id: immunization.id,
    vaccinationId: immunization.vaccinationId,
    antigen: immunization.immunizationAntigen?.map((ia) => antigenSerializer(ia.antigen)),
    isSuggested: immunization.isSuggested,
    monthOld: immunization.monthOld,
    isDeleted: immunization.isDeleted,
  };

  if (immunization.schedule) {
    serializedData = {
      ...serializedData,
      dateDue: immunization.schedule[0]?.dateDue,
      batchNo: immunization.schedule[0]?.batchNo,
      status: immunization.schedule[0]?.status,
      organization: immunization.schedule[0]?.organization,
      isCompleted: immunization.schedule[0]?.isCompleted,
      dateDone: immunization.schedule[0]?.dateDone,
      repeatShotAt: immunization.schedule[0]?.repeatShotAt,
      recordId: immunization.schedule[0]?.id,
    };
  }
  return serializedData;
};
