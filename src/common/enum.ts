export enum VerificationType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  MEMBER = 'member',
}

export enum NotificationEvent {
  UNIQUE_MILESTONE_CREATED = 'milestone.unique.created',
  NOTE_CREATED = 'note.created',
  BABY_BOOK_BIRTHDAY_UPDATED = 'babyBook.birthday.updated',
  HEALTH_FOLDER_CREATED = 'health.folder.created',
  GROWTH_POINT_CREATED = 'growthPoint.created',
  IMMUNIZATION_IS_DUE = 'immunization.isDue',
  CHECKS_UP_IS_DUE = 'checkUps.isDue',
  BABY_BOOK_SHARING_INVITATION = 'babyBook.sharing',
}

export enum SharingChangeEvent {
  UPDATE_BABY_BOOK = 'update.babyBook',
  UPDATE_BABY_BOOK_PHOTO = 'update.babyBook.photo',
  UPDATE_BABY_BOOK_BIRTHDAY_WITH_DELETION = 'update.babyBook.birthWithDeletion',
  UPDATE_BABY_BOOK_BIRTHDAY_WITHOUT_DELETION = 'update.babyBook.birthWithoutDeletion',
  UPDATE_GENERAL_INFORMATION = 'update.generalInformation',
  CREATE_MILESTONE_ALBUM = 'milestone.album.create',
  ADD_FILE_TO_MILESTONE = 'milestone.addFile',
  DELETE_MILESTONE_PHOTO = 'milestone.photo.delete',
  RESTORE_MILESTONE_PHOTO = 'milestone.photo.restore',
  DELETE_MILESTONE_ALBUM = 'milestone.album.delete',
  UPDATE_MILESTONE_ALBUM = 'milestone.album.update',
  UPDATE_MILESTONE_PHOTO = 'milestone.photo.update',
  CREATE_HEALTH_FOLDER = 'health.folder.create',
  UPDATE_HEALTH_FOLDER = 'health.folder.update',
  DELETE_HEALTH_FOLDER = 'health.folder.delete',
  DELETE_HEALTH_DOCUMENT = 'health.document.delete',
  UPDATE_HEALTH_DOCUMENT = 'health.document.update',
  CREATE_TAG = 'note.tag.create',
  UPDATE_TAG = 'note.tag.update',
  DELETE_TAG = 'note.tag.delete',
  CREATE_NOTE = 'note.create',
  UPDATE_NOTE = 'note.update',
  DELETE_NOTE = 'note.delete',
  DELETE_CHECK_UP_RECORD = 'checkUp.delete',
  UPDATE_CHECK_UP_RECORD = 'checkUp.update',
  CREATE_CHECK_UP_RECORD = 'checkUp.create',
  DELETE_CHECK_UP_FILE = 'checkUp.file.delete',
  CHANGE_CHECK_UP_VERSION = 'checkUp.version.change',
  CREATE_GROWTH_POINT = 'growthPoint.create',
  UPDATE_GROWTH_POINT = 'growthPoint.update',
  DELETE_GROWTH_POINT = 'growthPoint.delete',
  DELETE_SCHEDULE_IMMUNIZATION = 'immunization.schedule.delete',
  UPDATE_SCHEDULE_IMMUNIZATION = 'immunization.schedule.update',
  CREATE_SCHEDULE_IMMUNIZATION = 'immunization.schedule.create',
  CHANGE_VACCINATION = 'vaccination.change',
}

export enum EmailReminderType {
  CHECKS_UP = 'check-up',
  IMMUNIZATION = 'immunization',
}

export enum ProductType {
  BASIC = 'Basic',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum FeatureType {
  GENERAL_INFORMATION = 'General Information',
  MILESTONES = 'Milestones',
  HEALTH = 'Health Documents',
  IMMUNIZATION = 'Immunizations',
  NOTE = 'Appointment Notes',
  CHECKS_UP = 'Scheduled Check Up',
  GROWTH_CHART = 'Growth Chart',
}

export enum SharingRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
