import config from '../../../config/env';

const client = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);

enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
}

class PhoneVerification {
  /**
   * Verify a phone number
   *
   * @param {!string} to
   */
  async verifyPhoneToken(to: string, code: string) {
    const verification = await client.verify.v2.services(config.twilioServiceId).verificationChecks.create({ to, code });
    return verification.status === VerificationStatus.APPROVED;
  }

  /**
   * Request a SMS verification
   *
   * @param {!string} to
   */
  async requestPhoneVerification(to: string) {
    const verification = await client.verify.v2.services(config.twilioServiceId).verifications.create({ to, channel: 'sms' });
    return verification.status === VerificationStatus.PENDING;
  }
}

export default new PhoneVerification();
