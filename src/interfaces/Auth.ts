import { VerificationType } from '../common/enum';

export interface LoginParams {
  email: string;
  password: string;
  isBiometric?: boolean;
}

export interface RequestOTPParams {
  email: string;
  type: VerificationType;
}

export interface VerifyOTPParams {
  email: string;
  otp: string;
  expiredTime: Date;
}

export interface SignUpParams {
  countryCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmationPassword: string;
  subscribeNewsletter?: boolean;
}

export interface RequestResetPassword {
  email?: string;
  phone?: string;
  type: VerificationType;
}

export interface ResetPasswordParams {
  password: string;
  confirmationPassword: string;
}
