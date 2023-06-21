import dayjs from 'dayjs';
import { Request, Response } from 'express';
import mail from '../common/lib/Mail';
import constants, { API_PREFIX, FILE_PREFIX } from '../common/constants';
import env from '../../config/env';
import { VerificationType } from '../common/enum';
import BadRequestError from '../common/errors/types/BadRequestError';
import ForbiddenError from '../common/errors/types/ForbiddenError';
import NotFoundError from '../common/errors/types/NotFoundError';
import response from '../common/helpers/response';
import withTransaction from '../common/hooks/withTransaction';
import bcrypt from '../common/lib/Bcrypt';
import { generateToken } from '../common/lib/passports';
import phone from '../common/lib/Twillio';
import messages from '../common/messages';
import {
  LoginParams,
  RequestOTPParams,
  RequestResetPassword,
  ResetPasswordParams,
  SignUpParams,
  VerifyOTPParams,
} from '../interfaces/Auth';
import VerificationModel from '../models/Verification';
import AuthRepository from '../repositories/Auth';
import UserRepository from '../repositories/User';
import { verificationSerializer } from '../serializers/verificationSerializer';
import AuthServices from '../services/Auth';

class AuthController extends AuthServices {
  public login = async (req: Request<{}, {}, LoginParams>, res: Response) => {
    const { email, password, isBiometric } = req.body;
    const user = await AuthRepository.checkAuthentication(email, password);
    if (user) {
      const isTwoFactorAuthVerified = await AuthRepository.checkTwoFactorAuthVerified(user.id);
      if (!isTwoFactorAuthVerified) {
        throw new ForbiddenError();
      }
      if (env.byPassEmails.split('/').includes(user.email) || isBiometric) {
        const token = generateToken(user);

        response.success(res, {
          token,
        });
      } else {
        const verificationType = await AuthRepository.getDefaultVerificationType(user.id);
        await this.sendVerification(user, verificationType);

        response.success(res, {
          defaultType: verificationType,
          expiredTime: dayjs().add(5, 'minute').toDate(),
        });
      }
    } else {
      throw new BadRequestError(messages.auth.failed);
    }
  };

  public requestOTP = async (req: Request<{}, {}, RequestOTPParams>, res: Response) => {
    const { email, type } = req.body;
    const user = await UserRepository.getByEmail(email);
    if (user) {
      await this.sendVerification(user, type);
      response.success(res, {
        expiredTime: dayjs().add(5, 'minute').toDate(),
      });
    } else {
      throw new NotFoundError(messages.auth.userNotFound);
    }
  };

  public verifyOTP = async (req: Request<{}, {}, VerifyOTPParams>, res: Response) => {
    const { email, otp, expiredTime } = req.body;
    const user = await UserRepository.getByEmail(email);

    if (!user) {
      throw new NotFoundError(messages.auth.userNotFound);
    }
    const isAccountVerify = await AuthRepository.checkTwoFactorAuthVerified(user.id);

    const verified = await this.verifyUser(user, otp);

    if (dayjs().diff(expiredTime, 'second') > 0) {
      throw new BadRequestError(messages.auth.expiredVerificationCode);
    }

    if (verified) {
      const isTwoFactorAuthVerified = await AuthRepository.checkTwoFactorAuthVerified(user.id);
      let token: string;
      if (isTwoFactorAuthVerified) {
        token = generateToken(user);

        if (!isAccountVerify) {
          const mailOptions = {
            to: user.email,
            subject: messages.mail.subject.registerSuccessfully,
            template: constants.mailTemplate.registerSuccessfully,
            data: {
              welcomeImage: `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/welcome.png`,
              exploreURL: env.clientUrl,
              fName: `${user.firstName} ${user.lastName}`,
            },
          };

          mail.requestSendMail(mailOptions);
        }
      }

      response.success(res, token);
    } else {
      throw new BadRequestError(messages.auth.invalidVerificationCode);
    }
  };

  public signUp = async (req: Request<{}, {}, SignUpParams>, res: Response) => {
    await this.createUser(req.body);
    response.success(res);
  };

  public checkVerification = async (req: Request, res: Response) => {
    const verifications = await this.checkVerificationStatus(req.query.email as string);
    response.success(res, verifications.map(verificationSerializer));
  };

  public updateVerificationDefault = async (req: Request, res: Response) => {
    await VerificationModel.update({ isDefault: true }, { where: { id: req.params.id, userId: req.user.id } });
    response.success(res);
  };

  public requestResetPassword = async (req: Request<{}, {}, RequestResetPassword>, res: Response) => {
    const { email, type, phone } = req.body;
    const user = type === VerificationType.EMAIL ? await UserRepository.getByEmail(email) : await UserRepository.getByPhone(phone);

    if (user) {
      await this.sendVerification(user, type);
      const userRequest = {
        email: user.email,
        expiredTime: dayjs().add(5, 'minute').toDate(),
      };
      response.success(res, userRequest);
    } else {
      throw new NotFoundError(messages.auth.userNotFound);
    }
  };

  public setVerificationDefault = async (
    req: Request<{}, {}, { otp: string; type: 'sms' | 'email'; expiredTime: Date }>,
    res: Response
  ) => {
    const user = await UserRepository.getById(req.user.id);
    const { otp, type, expiredTime } = req.body;
    const verified = await this.verifyUser(user, otp);
    if (dayjs().diff(expiredTime, 'second') > 0) {
      throw new BadRequestError(messages.auth.expiredVerificationCode);
    }
    if (verified) {
      await VerificationModel.update({ isDefault: true }, { where: { userId: req.user.id, type } });
      response.success(res);
    } else {
      throw new BadRequestError(messages.auth.invalidVerificationCode);
    }
  };

  public resetPassword = async (req: Request<{}, {}, ResetPasswordParams>, res: Response) => {
    try {
      const { password } = req.body;
      await this.changePassword(password, req.user?.id);
      response.success(res);
    } catch (error) {
      throw new BadRequestError(messages.generalMessage.error);
    }
  };

  public requestUpdatePassword = async (req: Request<{}, {}, { oldPassword: string; newPassword: string }>, res: Response) => {
    const { body: params, user } = req;

    const type = await AuthRepository.getDefaultVerificationType(user.id);
    const existedUser = await UserRepository.getById(user.id);

    if (!existedUser) {
      throw new NotFoundError(messages.auth.userNotFound);
    }

    if (params.oldPassword === params.newPassword || !bcrypt.comparePassword(params.oldPassword, existedUser.password)) {
      throw new BadRequestError(messages.auth.incorrectPassword);
    }

    await this.sendVerification(existedUser, type);
    const userRequest = {
      type,
      expiredTime: dayjs().add(5, 'minute').toDate(),
    };
    response.success(res, userRequest);
  };

  public updatePassword = async (
    req: Request<{}, {}, { oldPassword: string; newPassword: string; otp: string; expiredTime: Date }>,
    res: Response
  ) => {
    const { otp, oldPassword, newPassword, expiredTime } = req.body;

    const existedUser = await UserRepository.getById(req.user.id);
    const verified = await this.verifyUser(existedUser, otp);
    if (dayjs().diff(expiredTime, 'second') > 0) {
      throw new BadRequestError(messages.auth.expiredVerificationCode);
    }

    if (!verified) {
      throw new BadRequestError(messages.auth.invalidVerificationCode);
    }

    if (oldPassword === newPassword || !bcrypt.comparePassword(oldPassword, existedUser.password)) {
      throw new BadRequestError(messages.auth.incorrectPassword);
    }
    await this.updatePasswordWithUser(newPassword, existedUser);
    const newToken = generateToken(existedUser);

    this.sendEmailChangePasswordSuccessfully(existedUser.email);

    response.success(res, newToken);
  };

  public requestChangePhone = async (req: Request<{}, {}, { newPhone: string; email: string; password: string }>, res: Response) => {
    const { newPhone, email, password } = req.body;

    const user = await AuthRepository.checkAuthentication(email, password);
    if (user) {
      const existedUser = await UserRepository.getByPhone(newPhone.trim());

      if (existedUser) {
        throw new BadRequestError(messages.user.phoneAlreadyInUse);
      }
      try {
        await phone.requestPhoneVerification(user.phone);
      } catch (error) {
        if (error.code === 60203) {
          throw new BadRequestError(messages.auth.maxAttemptsReach);
        }
      }
      response.success(res, {
        expiredTime: dayjs().add(5, 'minute').toDate(),
      });
    } else {
      throw new BadRequestError(messages.auth.failed);
    }
  };

  public updatePhone = async (
    req: Request<{}, {}, { newPhone: string; otp: string; email: string; password: string; expiredTime: Date }>,
    res: Response
  ) => {
    const { newPhone, otp, email, password, expiredTime } = req.body;
    const user = await AuthRepository.checkAuthentication(email, password);
    if (user) {
      let verified = false;
      try {
        verified = await phone.verifyPhoneToken(newPhone, otp);
      } catch (error) {
        if (error.code === 60202) {
          throw new BadRequestError(messages.auth.maxAttemptsReach);
        }
      }
      if (dayjs().diff(expiredTime, 'second') > 0) {
        throw new BadRequestError(messages.auth.expiredVerificationCode);
      }
      if (verified) {
        await withTransaction(async (trans) => {
          await this.changePhone(user, newPhone, trans);
        });
        const isTwoFactorAuthVerified = await AuthRepository.checkTwoFactorAuthVerified(user.id);
        let token: string;
        if (isTwoFactorAuthVerified) {
          token = generateToken(user);
        }

        response.success(res, token);
      } else {
        throw new BadRequestError(messages.auth.invalidVerificationCode);
      }
    } else {
      throw new BadRequestError(messages.auth.failed);
    }
  };
}

export default new AuthController();
