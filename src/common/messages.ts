export default {
  generalMessage: {
    error: 'There was some error',
    apiNotExist: 'Method does not exist',
    success: 'Success',
  },
  httpMessages: {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    544: 'Unknown HTTP Error',
  },
  auth: {
    failed: 'Either email or password is incorrect. Please try again',
    incorrectPassword: 'auth.incorrectPassword',
    userNotFound: 'User not found',
    invalidToken: 'Token invalid',
    invalidVerificationCode: 'verificationCode.invalid',
    expiredVerificationCode: 'verificationCode.expired',
    maxAttemptsReach: 'verificationCode.maxAttemptsReach',
    permissionDenied: 'Permission denied',
  },
  mail: {
    sendError: 'An error occurred while sending mail',
    subject: {
      resetPassword: 'Zesthealth Kids reset password',
      verificationCode: 'Zesthealth Kids Verification Code',
      changePasswordSuccess: 'Your Zesthealth Kids Password Was Changed',
      shareBabyBook: 'Zesthealth Kids share baby book',
      notificationReminder: 'Zesthealth Kids Notification',
      registerSuccessfully: 'Zesthealth Kids Register successfully',
      inviteVerification: (name: string, action: string) => `You received an invitation from ${name} to ${action} their baby book!`,
      stopSharing: (name: string) => `${name} stopped sharing their baby books with you`,
    },
  },
  upload: {
    fileAvatarExtensionNotAllow: 'The file extension is not supported',
    uploadLimitExceeded: 'toast.upload.limitExceeded',
  },
  babyBook: {
    notFound: 'Baby book not found',
    noBabySelected: 'babyBook.noItemSelected',
    sharingSessionNotFound: 'babyBook.sharingSession.notfound',
    sharingSessionInvalidEmail: 'babyBook.sharingSession.invalidEmail',
    sharingSessionExpired: 'babyBook.sharingSession.expired',
    shareYourself: 'babyBook.sharingSession.withYourself',
  },
  milestone: {
    alreadyExist: 'Milestones already exist!',
    albumNotFound: 'Milestone album not found',
    milestoneNotFound: 'Milestone not found',
    photoNotFound: 'Milestone photo not found',
    updateAlbumNameFailed: 'An error occurred while updating name of milestone album',
    noFileUpload: 'Cannot create milestone album without photos',
    albumNameExists: 'toast.milestone.unique.nameExists',
  },
  health: {
    noFileUpload: 'Cannot update folder without files',
    folderExists: 'health.folder.alreadyExists',
    folderNameExists: 'health.folderName.alreadyExists',
    documentNameExists: 'health.documentName.alreadyExists',
    folderNotFound: 'health.folder.notFound',
    documentNotFound: 'health.document.notFound',
    extensionConflict: 'health.document.extensionConflict',
  },
  generalInformation: {
    notFound: 'generalInformation.notFound',
  },
  note: {
    notFound: 'note.notFound',
  },
  tag: {
    notFound: 'tag.notFound',
    alreadyExists: 'tag.alreadyExists',
  },
  vaccination: {
    notFound: 'vaccination.notFound',
    alreadyExists: 'vaccination.alreadyExists',
  },
  immunization: {
    notFound: 'immunization.notFound',
    extractPdfFailed: 'immunization.error.extract.pdf',
  },
  antigen: {
    alreadyExists: 'antigen.alreadyExists',
    notFound: 'antigen.notFound',
  },
  immunizationSchedule: {
    notFound: 'immunizationSchedule.notFound',
  },
  checkUp: {
    versionNotFound: 'checkUp.version.notFound',
    versionExists: 'checkUp.version.alreadyExists',
    notFound: 'checkUp.notFound',
    noFileFound: 'checkUp.file.notFileUpload',
    scheduleNotFound: 'checkUp.schedule.notFound',
  },
  growthChart: {
    notFound: 'growPoint.notFound',
    agePeriodNotFound: 'agePeriod.notFound',
    notFoundBabyData: 'growPoint.babyData.notFound',
    alreadyExists: 'growPoint.alreadyExists',
  },
  user: {
    notFound: 'user.notFound',
    changePasswordFailed: 'Change password failed',
    phoneAlreadyInUse: 'user.phone.alreadyInUse',
    deviceTokenNotFound: 'user.deviceTokenNotFound',
  },
  category: {
    notFound: 'category.notFound',
    alreadyExists: 'category.alreadyExists',
  },
  news: {
    notFound: 'news.notFound',
    alreadyExists: 'news.alreadyExists',
    noFileFound: 'news.noFileFound',
  },
  notification: {
    notFound: 'notification.notFound',
  },
  subscription: {
    notFound: 'subscription.notFound',
  },
};
