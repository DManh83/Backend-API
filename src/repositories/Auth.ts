import bcrypt from '../common/lib/Bcrypt';
import VerificationModel from '../models/Verification';
import UserRepository from './User';

class AuthRepository {
  async checkAuthentication(email: string, password: string): Promise<any | undefined> {
    const user = await UserRepository.getByEmail(email);

    if (!user || (password && !bcrypt.comparePassword(password, user.password))) {
      return undefined;
    }

    return user;
  }

  async checkTwoFactorAuthVerified(userId: string) {
    const verifications = await VerificationModel.findAll({ where: { userId, isVerified: true } });
    return verifications.length === 2;
  }

  async getDefaultVerificationType(userId: string) {
    const defaultVerification = await VerificationModel.findOne({ where: { userId, isVerified: true, isDefault: true } });
    return defaultVerification.type;
  }
}

export default new AuthRepository();
