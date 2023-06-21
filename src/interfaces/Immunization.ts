import { PaginationParams } from '../common/helpers/pagination/types';

export interface VaccinationAttributes {
  id: string;
  userId?: string;
  babyBookId?: string;
  name: string;
  country: string;
  isSuggested: boolean;
  totalImmunization: number;
  mainColor?: string;
  subColor?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isReleased?: boolean;
  code?: string;
  year?: number;
  tooltip?: string;
  indigenous?: boolean;
  medicalCondition?: boolean;
  immunization?: ImmunizationAttributes[];
}

export type VaccinationCreation = Omit<VaccinationAttributes, 'id'>;

export interface ImmunizationAttributes {
  id: string;
  userId?: string;
  vaccinationId?: string;
  isSuggested: boolean;
  monthOld: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  schedule?: ImmunizationScheduleAttributes;
  tooltip?: string;
  antigenId?: string;
  immunizationAntigen?: ImmunizationAntigenAttributes[];
}

export type ImmunizationCreation = Omit<ImmunizationAttributes, 'id'>;

export interface ImmunizationScheduleAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  vaccinationId: string;
  immunizationId: string;
  dateDue: Date;
  batchNo?: string;
  status?: string;
  organization?: string;
  isSuggested: boolean;
  isCompleted?: boolean;
  dateDone?: Date;
  repeatShotAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  immunizations?: ImmunizationAttributes;
}

export type ImmunizationScheduleCreation = Omit<ImmunizationScheduleAttributes, 'id'>;

export interface UserVaccinationAttributes {
  id: string;
  userId: string;
  babyBookId: string;
  vaccinationId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  vaccination?: VaccinationAttributes;
}

export type UserVaccinationCreation = Omit<UserVaccinationAttributes, 'id'>;

export interface AntigenAttributes {
  id: string;
  userId?: string;
  name: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AntigenCreation = Omit<AntigenAttributes, 'id'>;

export interface ImmunizationAntigenAttributes {
  id: string;
  immunizationId: string;
  antigenId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  antigen?: AntigenAttributes;
}

export type ImmunizationAntigenCreation = Omit<ImmunizationAntigenAttributes, 'id'>;

export interface CreateImmunizationParams {
  vaccinationId: string;
  antigen: string[];
  monthOld?: number;
  dateDue: Date;
  batchNo?: string;
  status?: string;
  organization?: string;
  dateDone?: Date;
  repeatShotAt?: Date;
}

export interface GetVaccinationListParams extends PaginationParams {
  isSuggested?: boolean;
  isReleased?: boolean;
  userId?: string;
  babyBookId?: string;
}

export interface GetListImmunizationParams extends PaginationParams {
  page?: number;
  pageSize?: number;
  vaccinationId?: string;
  isGetAll?: string;
  babyBookId?: string;
}

export interface GetSelectedVaccinationParams {
  babyBookId?: string;
}

export interface UpdateImmunizationScheduleParams {
  batchNo?: string;
  status?: string;
  dateDone?: Date;
  dateDue?: Date;
  antigen?: string[];
  organization?: string;
  repeatShotAt?: Date;
}

export interface UpdateVaccinationParams {
  isReleased?: boolean;
  tooltip?: string;
}

export interface ChangeVaccinationVersionParams {
  currentId?: string;
  newId: string;
  babyBookId: string;
}

export interface CreateNewVaccinationParams {
  name: string;
  country: string;
  year: number;
  code: string;
  indigenous: boolean;
  medicalCondition: boolean;
  isReleased: boolean;
  tooltip?: string;
  schedules: {
    monthOld: number;
    antigen: string[];
  }[];
}

export interface CreateSuggestedImmunizationParams {
  vaccinationId: string;
  schedules: {
    monthOld: number;
    antigen: string[];
  }[];
}

export interface UpdateSuggestedImmunizationParams {
  antigen: string[];
}

export interface CreateNewAntigenParams {
  name: string;
}

export interface ExtractImmunizationFromPDF {
  file: string;
  babyBookId: string;
  vaccinationId: string;
}
