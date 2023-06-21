import { VerificationType } from '../common/enum';
import { UserAttributes } from './User';

export interface VerificationAttributes {
  id: string;
  userId: string;
  type: VerificationType;
  isVerified: boolean;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type VerificationDTO = VerificationAttributes & { creator: UserAttributes };
