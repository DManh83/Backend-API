/* eslint-disable */
declare namespace Express {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    otpSecret?: string;
    phone: string;
    countryCode: string;
    createdAt?: Date;
    updatedAt?: Date;
    role?: string;
    checkUpsNotify: boolean;
    immunizationsNotify: boolean;
    generalInformationNotify: boolean;
    customCheckUpsNotify?: boolean;
    customImmunizationsNotify?: boolean;
    inactivityNotify: boolean;
    stripeCustomerId?: string;
    subscription?: any;
    usedStorage?: number;
    requestBy?: string;
    pushNotify?: boolean;
    receiveMail?: boolean;
  }

  interface Session {
    id: string;
    userId: string;
    email: string;
    sharedAt?: Date;
    availableAfter?: Date;
    duration: number;
    totalBabyBook: number;
    expiredAfter?: Date;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    sessionBabyBook?: {
      id: string;
      sessionId: string;
      babyBookId: string;
    }[];
  }

  export interface Request {
    user?: User;
    session?: Session;
  }
}
