import dayjs from 'dayjs';
import { has, uniq } from 'lodash';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';

import { UserAttributes } from '../interfaces/User';
import env from '../../config/env';
import constants, { API_PREFIX, FILE_PREFIX } from '../common/constants';
import { NotificationEvent, SharingChangeEvent, SharingRole } from '../common/enum';
import imageStore from '../common/helpers/imageStore';
import mail from '../common/lib/Mail';
import messages from '../common/messages';
import {
  BabyBookAttributes,
  BabyBookUpdateParams,
  ShareBabyBookParams,
  SharingChangeAttributes,
  SharingSessionBabyBookCreation,
  SharingSessionCreation,
} from '../interfaces/BabyBook';
import BabyBookModel from '../models/BabyBook';
import NotificationModel from '../models/Notification';
import SharingChangeModel from '../models/SharingChange';
import SharingSessionModel from '../models/SharingSession';
import SharingSessionBabyBookModel from '../models/SharingSessionBabyBook';
import UserModel from '../models/User';
import FirebaseMessage from '../common/lib/FirebaseMessage';

class BabyBookServices {
  async updateBabyBooks(babyBook: BabyBookModel, updateData: BabyBookUpdateParams, userEmail?: string): Promise<BabyBookAttributes> {
    const changes: SharingChangeAttributes[] = [];

    ['name', 'indigenous', 'medicalCondition'].forEach((key) => {
      if (has(updateData, key) && `${babyBook[key] || false}` !== `${updateData[key]}` && userEmail) {
        changes.push({
          id: uuidv4(),
          userId: babyBook.userId,
          email: userEmail,
          babyBookId: babyBook.id,
          event: SharingChangeEvent.UPDATE_BABY_BOOK,
          from: {
            [key]: babyBook[key] || false,
          },
          to: {
            [key]: updateData[key],
          },
        });
      }
    });

    if (updateData.name) {
      babyBook.name = updateData.name;
    }

    if (updateData.birthday) {
      babyBook.birthday = updateData.birthday;
    }

    babyBook.indigenous = updateData.indigenous;
    babyBook.medicalCondition = updateData.medicalCondition;

    if (updateData.photo || JSON.parse(updateData.isRemovePhoto || 'false')) {
      await imageStore.deleteFile(babyBook.userId, babyBook.photo);

      babyBook.photo = updateData.photo || null;
      changes.push({
        id: uuidv4(),
        userId: babyBook.userId,
        email: userEmail,
        babyBookId: babyBook.id,
        event: SharingChangeEvent.UPDATE_BABY_BOOK_PHOTO,
      });
    }
    await babyBook.save();

    if (changes.length) {
      SharingChangeModel.bulkCreate(changes);
    }

    return babyBook;
  }

  async deleteBabyBooks(babyBooks: BabyBookModel[], force: boolean, transaction: Transaction) {
    const deletedIds = babyBooks.map((b) => b.id);
    const sessionBabyBook = await SharingSessionBabyBookModel.findAll({ where: { babyBookId: { [Op.in]: deletedIds } } });
    const sessionIds = uniq(sessionBabyBook.map((s) => s.sessionId));

    await SharingSessionModel.update(
      {
        expiredAfter: new Date(),
        availableAfter: new Date(),
      },
      {
        where: {
          id: {
            [Op.in]: sessionIds,
          },
        },
        transaction,
      }
    );

    return Promise.all(
      babyBooks.map(async (babyBook) => {
        if (force) {
          await imageStore.deleteFile(babyBook.userId, babyBook.photo);
          return babyBook.destroy({ transaction });
        }

        babyBook.isDeleted = true;
        return babyBook.save({ transaction });
      })
    );
  }

  createSharingSession = async (
    user: UserAttributes,
    { email, duration, babyBookIds, role }: ShareBabyBookParams,
    transaction: Transaction
  ) => {
    const params: SharingSessionCreation = {
      userId: user.id,
      email,
      sharedAt: new Date(),
      duration,
      totalBabyBook: babyBookIds.length,
      isDeleted: false,
      role,
    };
    if (role === SharingRole.EDITOR) {
      params.availableAfter = new Date();
      params.expiredAfter = null;
      params.duration = 0;
    }
    const sharingSession = await SharingSessionModel.create(params, { transaction });

    if (sharingSession.role === SharingRole.EDITOR) {
      const existedUser = await UserModel.findOne({ where: { email } });
      if (existedUser) {
        await NotificationModel.create(
          {
            userId: existedUser.id,
            event: NotificationEvent.BABY_BOOK_SHARING_INVITATION,
            metadata: `${user.firstName} ${user.lastName}`,
            isSeen: false,
            isDeleted: false,
          },
          { transaction }
        );
      }
    }
    return sharingSession;
  };

  createSharingSessionBabyBookRelationship = async (session: SharingSessionModel, babyBookIds: string[], transaction: Transaction) => {
    const records: SharingSessionBabyBookCreation[] = babyBookIds.map((id) => ({
      id: uuidv4(),
      sessionId: session.id,
      babyBookId: id,
      isDeleted: false,
    }));

    return SharingSessionBabyBookModel.bulkCreate(records, { transaction });
  };

  sendEmailSharingSuccessfully = (
    email: string,
    session: SharingSessionModel,
    user: { firstName: string; lastName: string },
    babyBooks: BabyBookModel[]
  ): Promise<string> => {
    const babyNames = babyBooks.map((b) => b.name);

    const babyName = `${babyNames.slice(0, babyNames.length - 1).join(', ')} ${
      babyNames.length > 1 ? ` and ${babyNames[babyNames.length - 1]}` : babyNames[babyNames.length - 1]
    }`;

    const mailOptions = {
      to: email,
      subject: messages.mail.subject.inviteVerification(
        `${user.firstName} ${user.lastName}`,
        session.role === SharingRole.VIEWER ? 'view' : 'edit'
      ),
      template: constants.mailTemplate.shareBabyBook,
      data: {
        invitationLink: `${env.clientUrl}/shared/${session.id}`,
        shareImageUrl: `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/share-baby-book.png`,
        firstName: user.firstName,
        lastName: user.lastName,
        role: session.role === SharingRole.VIEWER ? 'view' : 'edit',
        babyName,
        duration: session.duration,
      },
    };

    return mail.requestSendMail(mailOptions);
  };

  sendEmailAndNotificationStopSharing = (
    email: string,
    session: SharingSessionModel,
    user: { firstName: string; lastName: string },
    babyBooks: BabyBookModel[],
    tokenIds: string[]
  ): Promise<string> => {
    const babyNames = babyBooks.map((b) => b.name);

    const babyName = `${babyNames.slice(0, babyNames.length - 1).join(', ')} ${
      babyNames.length > 1 ? ` and ${babyNames[babyNames.length - 1]}` : babyNames[babyNames.length - 1]
    }`;

    const mailOptions = {
      to: email,
      subject: messages.mail.subject.stopSharing(`${user.firstName} ${user.lastName}`),
      template: constants.mailTemplate.stopShareBabyBook,
      data: {
        invitationLink: `${env.clientUrl}/shared/${session.id}`,
        shareImageUrl: `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/share-baby-book.png`,
        firstName: user.firstName,
        lastName: user.lastName,
        babyName,
      },
    };

    FirebaseMessage.sendMessageMulticast(
      tokenIds,
      'Shared baby book',
      `${user.firstName} ${user.lastName} stopped sharing the editor role for ${babyName}'s Baby book with you`
    );

    return mail.requestSendMail(mailOptions);
  };

  activateSharingSessionService = async (sharingSession: SharingSessionModel, transaction: Transaction) => {
    sharingSession.availableAfter = new Date();
    if (sharingSession.duration !== 0) {
      sharingSession.expiredAfter = new Date(dayjs().add(sharingSession.duration, 'minute').valueOf());
    }

    return sharingSession.save({ transaction });
  };

  stopSharingSessionService = async (sharingSession: SharingSessionModel, transaction: Transaction) => {
    sharingSession.expiredAfter = new Date();
    return sharingSession.save({ transaction });
  };
}

export default BabyBookServices;
