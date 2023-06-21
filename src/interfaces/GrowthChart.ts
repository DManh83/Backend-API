import { Sex } from '../common/enum';

export interface AgePeriodAttributes {
  id: string;
  minAgeMonth: number;
  maxAgeMonth: number;
  text: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AgePeriodCreation = Omit<AgePeriodAttributes, 'id'>;

export interface GrowthPointAttributes {
  id: string;
  userId?: string;
  babyBookId?: string;
  date?: Date;
  headCircumference: number;
  weight: number;
  height: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isPercentile: boolean;
  versionYear?: number;
  isReleased?: boolean;
  level?: string;
  sex?: Sex;
  ageMonth?: number;
  color?: string;
}

export type GrowthPointCreation = Omit<GrowthPointAttributes, 'id'>;

export interface CreateGrowthRecordParams {
  babyBookId: string;
  date: Date;
  headCircumference: number;
  weight: number;
  height: number;
}

export interface GetGrowthPointListParams {
  searchBy?: keyof GrowthPointCreation;
  periodId?: string;
  babyBookId?: string;
  isPercentile?: boolean;
  isOutdated?: boolean;
  sex?: Sex;
  versionYear?: number;
}

export interface DeleteGrowthPointParams {
  ids?: string[];
}

export interface UpdateAgePeriodParams {
  ages: {
    id: string;
    text: string;
    minAgeMonth: number;
    maxAgeMonth: number;
  }[];
}

export interface AddPercentileParams {
  points: {
    sex: Sex;
    ageMonth: number;
    weight: number;
    height: number;
    headCircumference: number;
    level: string;
    color?: string;
  }[];
  versionYear: number;
  isReleased: boolean;
}

export interface UpdateGrowthPointParams {
  date?: Date;
  weight?: number;
  height?: number;
  headCircumference?: number;
}

export interface DeletePercentilesParams {
  level?: string;
  month?: number;
  versionYear?: number;
}

export interface UpdatePercentilesParams {
  isReleased?: boolean;
  versionYear?: number;
}
