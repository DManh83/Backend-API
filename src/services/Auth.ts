import { nanoid } from 'nanoid';
import { Transaction } from 'sequelize/types';

import env from '../../config/env';
import constants, { API_PREFIX, FILE_PREFIX } from '../common/constants';
import { VerificationType } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ConflictError from '../common/errors/types/ConflictError';
import NotFoundError from '../common/errors/types/NotFoundError';
import bcrypt from '../common/lib/Bcrypt';
import mail from '../common/lib/Mail';
import otp from '../common/lib/OTP';
import phone from '../common/lib/Twillio';
import messages from '../common/messages';
import { SignUpParams } from '../interfaces/Auth';
import { UserAttributes, UserCreation } from '../interfaces/User';
import UserModel from '../models/User';
import VerificationModel from '../models/Verification';
import AuthRepository from '../repositories/Auth';
import UserRepository from '../repositories/User';

export default class AuthServices {
  async createUser(data: SignUpParams): Promise<UserAttributes | undefined> {
    const user = await UserRepository.getByEmail(data.email);
    data.password = bcrypt.generateHashPassword(data.password);

    if (user) {
      throw new ConflictError('User existed');
    }

    const userByPhone = await UserRepository.getByPhone(data.phone);
    if (userByPhone) {
      throw new ConflictError('This phone number already exists');
    }

    if (!user) {
      const createdUser = await UserModel.create(data as UserCreation);
      return createdUser;
    }

    return undefined;
  }

  async sendVerification(user: UserModel, type: VerificationType = undefined) {
    // @TODO Check verification table
    const verificationType = type || (await AuthRepository.getDefaultVerificationType(user.id));

    // SMS
    if (verificationType === VerificationType.SMS) {
      await user.update({ otpSecret: null });
      let isSent = false;
      try {
        isSent = await phone.requestPhoneVerification(user.phone);
      } catch (error) {
        if (error.code === 60203) {
          throw new BadRequestError(messages.auth.maxAttemptsReach);
        }
      }
      return isSent;
    }

    // Email
    const otpSecret = nanoid();
    await user.update({ otpSecret });

    const mailOptions = {
      to: user.email,
      subject: messages.mail.subject.verificationCode,
      template: constants.mailTemplate.verificationCode,
      data: {
        code: otp.generate(otpSecret),
        shieldUrl: `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/shield.png`,
      },
    };

    return mail.requestSendMail(mailOptions);
  }

  public async verifyUser(user: UserAttributes, code: string) {
    let verified = false;
    let verifyType = VerificationType.EMAIL;

    // SMS - User not stored OTP code in database
    if (!user.otpSecret) {
      try {
        verified = await phone.verifyPhoneToken(user.phone, code);
        if (verified) {
          verifyType = VerificationType.SMS;
        }
      } catch (error) {
        if (error.code === 60202) {
          throw new BadRequestError(messages.auth.maxAttemptsReach);
        }
      }
    } else {
      // Email
      verified = otp.verify(code, user.otpSecret);
    }

    // Update verification status
    if (verified) {
      await VerificationModel.update({ isVerified: true }, { where: { userId: user.id, type: verifyType } });
    }

    return verified;
  }

  async checkVerificationStatus(email: string): Promise<any> {
    const user = await UserRepository.getByEmail(email);

    if (!user) {
      throw new NotFoundError(messages.auth.userNotFound);
    }
    const verifications = await VerificationModel.findAll({
      where: { userId: user.id },
      include: [{ model: UserModel, as: 'creator' }],
    });
    return verifications;
  }

  async sendEmailResetPassWord(email: string): Promise<string> {
    const mailOptions = {
      to: email,
      subject: messages.mail.subject.resetPassword,
      template: constants.mailTemplate.verifyToken,
      data: {
        verifyLink: `${env.clientUrl}/reset-password?token=`,
      },
    };

    return mail.requestSendMail(mailOptions);
  }

  async sendEmailChangePasswordSuccessfully(email: string): Promise<string> {
    const mailOptions = {
      to: email,
      subject: messages.mail.subject.changePasswordSuccess,
      template: constants.mailTemplate.changePasswordSuccessfully,
    };

    return mail.requestSendMail(mailOptions);
  }

  async changePassword(newPassword: string, userId: string): Promise<[number, UserModel[]]> {
    const hashPassword = bcrypt.generateHashPassword(newPassword);
    return UserModel.update({ password: hashPassword, passwordUpdateAt: new Date() }, { where: { id: userId } });
  }

  async updatePasswordWithUser(newPassword: string, user: UserModel) {
    const hashPassword = bcrypt.generateHashPassword(newPassword);
    user.password = hashPassword;
    user.passwordUpdateAt = new Date();
    return user.save();
  }

  public changePhone = async (user: UserModel, phone: string, transaction: Transaction) => {
    await VerificationModel.update({ isVerified: true }, { where: { userId: user.id, type: VerificationType.SMS } });
    user.phone = phone;
    return user.save({ transaction });
  };
}
