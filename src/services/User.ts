import { has } from 'lodash';
import { Transaction } from 'sequelize/types';
import { Sex } from '../common/enum';
import { DeviceCreation } from '../interfaces/DevicesKey';

import { UserCreation, UserUpdateParams } from '../interfaces/User';
import DeviceModel from '../models/DevicesKey';
import UserModel from '../models/User';

class UserServices {
  public updateUserService = async (user: UserModel, data: Partial<UserCreation>, transaction: Transaction) => {
    user.role = data.role;
    return user.save({ transaction });
  };

  public updateUserInfo = async (user: UserModel, updateData: UserUpdateParams, transaction: Transaction) => {
    if (has(updateData, 'birthday')) {
      user.birthday = updateData.birthday;
    }
    if (has(updateData, 'firstName')) {
      user.firstName = updateData.firstName;
    }
    if (has(updateData, 'lastName')) {
      user.lastName = updateData.lastName;
    }
    if (has(updateData, 'sex') && [Sex.FEMALE, Sex.MALE].includes(updateData.sex)) {
      user.sex = updateData.sex;
    }
    if (has(updateData, 'streetAddress')) {
      user.streetAddress = updateData.streetAddress;
    }
    if (has(updateData, 'workPhone')) {
      user.workPhone = updateData.workPhone;
    }
    if (has(updateData, 'streetAddress')) {
      user.streetAddress = updateData.streetAddress;
    }
    if (has(updateData, 'cityTown')) {
      user.cityTown = updateData.cityTown;
    }
    if (has(updateData, 'stateProvince')) {
      user.stateProvince = updateData.stateProvince;
    }
    if (has(updateData, 'postalCode')) {
      user.postalCode = updateData.postalCode;
    }
    if (has(updateData, 'avatar')) {
      user.avatar = updateData.avatar;
    }
    if (has(updateData, 'checkUpsNotify')) {
      user.checkUpsNotify = updateData.checkUpsNotify;
    }
    if (has(updateData, 'customCheckUpsNotify')) {
      user.customCheckUpsNotify = updateData.customCheckUpsNotify;
    }
    if (has(updateData, 'customImmunizationsNotify')) {
      user.customImmunizationsNotify = updateData.customImmunizationsNotify;
    }
    if (has(updateData, 'immunizationsNotify')) {
      user.immunizationsNotify = updateData.immunizationsNotify;
    }
    if (has(updateData, 'generalInformationNotify')) {
      user.generalInformationNotify = updateData.generalInformationNotify;
    }
    if (has(updateData, 'inactivityNotify')) {
      user.inactivityNotify = updateData.inactivityNotify;
    }
    if (has(updateData, 'countryCode')) {
      user.countryCode = updateData.countryCode;
    }
    if (has(updateData, 'seenSharingGuide')) {
      user.seenSharingGuide = updateData.seenSharingGuide;
    }
    if (has(updateData, 'pushNotify')) {
      user.pushNotify = updateData.pushNotify;
    }
    if (has(updateData, 'receiveMail')) {
      user.receiveMail = updateData.receiveMail;
    }
    if (has(updateData, 'subscribeNewsletter')) {
      user.subscribeNewsletter = updateData.subscribeNewsletter;
    }

    return user.save({ transaction });
  };

  public changePhone = async (user: UserModel, phone: string, transaction: Transaction) => {
    user.phone = phone;
    return user.save({ transaction });
  };

  public changeSessionExpire = async (user: UserModel, sessionExpire: number, transaction: Transaction) => {
    user.sessionExpire = sessionExpire;
    return user.save({ transaction });
  };

  public addDeviceTokenService = async (userId: string, token: string, transaction: Transaction) => {
    const deviceTokenShape: DeviceCreation = {
      userId,
      token,
    };

    await DeviceModel.create(deviceTokenShape, { transaction });
  };

  public deleteDeviceTokenService = async (token: string, transaction: Transaction) => {
    await DeviceModel.destroy({
      where: {
        token,
      },
      transaction,
    });
  };
}

export default UserServices;
