import imageStore from '../common/helpers/imageStore';
import { UserAttributes } from '../interfaces/User';

export const userSerializer = (user: UserAttributes) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  countryCode: user.countryCode,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  totalBabyBook: user.totalBabyBook,
  role: user.role,
  birthday: user.birthday,
  workPhone: user.workPhone,
  streetAddress: user.streetAddress,
  cityTown: user.cityTown,
  stateProvince: user.stateProvince,
  postalCode: user.postalCode,
  sex: user.sex,
  passwordUpdateAt: user.passwordUpdateAt,
  sessionExpire: user.sessionExpire,
  avatar: imageStore.getUrl(user.id, user.avatar),
  checkUpsNotify: user.checkUpsNotify,
  customCheckUpsNotify: user.customCheckUpsNotify,
  customImmunizationsNotify: user.customImmunizationsNotify,
  immunizationsNotify: user.immunizationsNotify,
  generalInformationNotify: user.generalInformationNotify,
  inactivityNotify: user.inactivityNotify,
  seenSharingGuide: user.seenSharingGuide,
  pushNotify: user.pushNotify,
  receiveMail: user.receiveMail,
  userStorage: user.usedStorage,
  subscribeNewsletter: user.subscribeNewsletter,
});
