import { VerificationDTO } from '../interfaces/Verification';
import { VerificationType } from '../common/enum';

export const verificationSerializer = (verification: VerificationDTO) => ({
  id: verification.id,
  type: verification.type,
  isVerified: verification.isVerified,
  isDefault: verification.isDefault,
  protected: verification.type === VerificationType.SMS ? verification.creator.phone.slice(-4) : verification.creator.email,
  createdAt: verification.createdAt,
  updatedAt: verification.updatedAt,
});
