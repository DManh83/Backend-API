import dotenv from 'dotenv';

export enum Environment {
  Production = 'production',
  Development = 'development',
}

// Load environment
dotenv.config({
  path: './.env',
});

const poolConfig = {
  max: 100,
  min: 0,
  idle: 20000,
  acquire: 20000,
  evict: 30000,
  handleDisconnects: true,
};

const database = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'babybook',
  host: process.env.DB_HOST || 'localhost',
  pool: process.env.enableConnectionPool ? poolConfig : undefined,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === Environment.Development,
  port: parseInt(process.env.DB_PORT),
  timezone: '+00:00',
};

export default {
  appName: process.env.APP_NAME || 'BabyBook',
  /**
   * Application environment mode either development or production or test
   */
  environment: process.env.NODE_ENV || Environment.Development,

  /**
   * Database connection for each environment
   */
  database,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '20d',
  jwtVerifyExpiresIn: '24h',
  jwtResetPasswordExpiresIn: '1h',

  salt: process.env.SALT || '10',

  /**
   * Mail server information
   */
  mailServer: process.env.EMAIL_SERVER,
  mailPort: process.env.EMAIL_PORT,
  mailAuthUserName: process.env.EMAIL_AUTH_USERNAME,
  mailAuthPassword: process.env.EMAIL_AUTH_PASSWORD,
  senderEmail: process.env.SENDER_EMAIL,
  senderName: process.env.SENDER_NAME,
  sysAdminEmail: process.env.SYS_ADMIN_EMAIL,

  /**
   * Twilio
   */
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioServiceId: process.env.TWILIO_SERVICE_ID,

  /**
   * Redis configuration
   */
  redisUrl: process.env.REDIS_URL,

  /**
   * Client Url
   */
  clientUrl: process.env.CLIENT_URL,
  supportPageUrl: process.env.SUPPORT_PAGE_URL,
  apiUrl: process.env.API_URL,

  /**
   * The folder storage record files
   */
  assetsPath: process.env.ASSETS_PATH,

  /**
   * The crons jobs config
   */
  babyBookDeletionSchedule: process.env.BABY_BOOK_DELETION_SCHEDULE || '* * * * *',
  babyBookRetentionPeriod: process.env.BABY_BOOK_RETENTION_PERIOD || '7',

  milestoneDeletionSchedule: process.env.MILESTONE_DELETION_SCHEDULE || '* * * * *',
  milestoneRetentionPeriod: process.env.MILESTONE_RETENTION_PERIOD || '30',

  healthDeletionSchedule: process.env.HEALTH_DELETION_SCHEDULE || '* * * * *',
  healthRetentionPeriod: process.env.HEALTH_RETENTION_PERIOD || '30',

  noteDeletionSchedule: process.env.NOTE_DELETION_SCHEDULE || '* * * * *',
  noteRetentionPeriod: process.env.NOTE_RETENTION_PERIOD || '30',

  checkUpDeletionSchedule: process.env.CHECK_UP_DELETION_SCHEDULE || '* * * * *',
  checkUpRetentionPeriod: process.env.CHECK_UP_RETENTION_PERIOD || '30',

  notificationCreationSchedule: process.env.NOTIFICATION_CREATION_SCHEDULE || '0 9 * * *',

  /**
   * The otp secret life
   */
  otpSecretLife: process.env.OTP_SECRET_LIFE || '5',

  /**
   * Sentry configuration
   */
  sentryDns: process.env.SENTRY_DNS,
  sentryEnv: process.env.SENTRY_ENV,

  /**
   * Stripe configuration
   */
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  /**
   * Firebase server
   */
  firebaseServerKey: process.env.FIREBASE_SERVER_KEY,

  /**
   * Cloud vision api
   */
  cloudVisionApiKey: process.env.CLOUD_VISION_API_KEY,

  /**
   * Mailjet api
   */
  mjApiKeyPublic: process.env.MJ_API_KEY_PUBLIC,
  mjApiKeyPrivate: process.env.MJ_API_KEY_PRIVATE,

  byPassEmails: process.env.BY_PASS_EMAILS || '',
};
