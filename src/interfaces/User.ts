import { Sex, UserRole } from '../common/enum';
import { SubScriptionAttributes } from './Subscription';

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  otpSecret?: string;
  phone: string;
  countryCode: string;
  birthday?: Date;
  workPhone?: string;
  streetAddress?: string;
  cityTown?: string;
  stateProvince?: string;
  postalCode?: string;
  sex?: Sex;
  avatar?: string;
  passwordUpdateAt?: Date;
  sessionExpire?: number;
  createdAt?: Date;
  updatedAt?: Date;
  totalBabyBook?: number;
  role?: UserRole;
  checkUpsNotify?: boolean;
  customCheckUpsNotify?: boolean;
  customImmunizationsNotify?: boolean;
  immunizationsNotify?: boolean;
  generalInformationNotify?: boolean;
  inactivityNotify?: boolean;
  stripeCustomerId?: string;
  paymentMethod?: Object;
  subscription?: SubScriptionAttributes;
  usedStorage?: number;
  seenSharingGuide?: boolean;
  pushNotify?: boolean;
  receiveMail?: boolean;
  subscribeNewsletter?: boolean;
}

export type UserCreation = Omit<UserAttributes, 'id'>;

export interface GetUserListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  roles?: UserRole[];
  searchValue?: string;
  countryCodes?: string[];
  subscribers?: boolean;
}

export interface UpdateStaffParams {
  email: string;
  role: UserRole;
}

export interface CountUserParams {
  from?: Date;
  to?: Date;
  viewBy?: string;
}
export interface UserUpdateParams {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  birthday?: Date;
  streetAddress?: string;
  workPhone?: string;
  stateProvince?: string;
  cityTown?: string;
  postalCode?: string;
  sex?: Sex;
  avatar?: string;
  fileName?: string;
  checkUpsNotify?: boolean;
  customCheckUpsNotify?: boolean;
  customImmunizationsNotify?: boolean;
  immunizationsNotify?: boolean;
  generalInformationNotify?: boolean;
  inactivityNotify?: boolean;
  seenSharingGuide?: boolean;
  pushNotify?: boolean;
  receiveMail?: boolean;
  subscribeNewsletter?: boolean;
}

export interface RequestChangePassword {
  email?: string;
  phone?: string;
}
