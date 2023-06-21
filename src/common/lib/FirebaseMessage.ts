import request from 'request';
import config from '../../../config/env';

import { logger } from '../helpers/logger';

const { firebaseServerKey } = config;

class FirebaseMessage {
  async sendMessageToToken(deviceToken: string, title: string, body: string, data?: any) {
    try {
      request.post('https://fcm.googleapis.com/fcm/send', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${firebaseServerKey}`,
        },
        json: {
          to: deviceToken,
          priority: 'high',
          content_available: true,
          mutable_content: true,
          data,
          notification: {
            title,
            body,
            mutable_content: true,
            sound: 'default',
          },
        },
      });
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }

  async sendMessageMulticast(deviceTokens: string[], title: string, body: string, data?: any) {
    try {
      request.post('https://fcm.googleapis.com/fcm/send', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${firebaseServerKey}`,
        },
        json: {
          registration_ids: deviceTokens,
          priority: 'high',
          content_available: true,
          mutable_content: true,
          data,
          notification: {
            title,
            body,
            mutable_content: true,
            sound: 'default',
          },
        },
      });
    } catch (error) {
      logger.error(error);
    }
  }
}

export default new FirebaseMessage();
