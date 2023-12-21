import { FcmService } from '@doracoder/fcm-nestjs';
import { Injectable, Logger } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class FCMService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly logger: Logger
  ) {}

  async sendToDevices(
    devices: Array<string>,
    payload: firebaseAdmin.messaging.MessagingPayload,
    silent: boolean
  ) {
    if (devices.length == 0) {
      throw new Error('You provide an empty device ids list!');
    }
    let result = null;
    try {
      result = await this.fcmService.sendNotification(devices, payload, silent);
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'fcm-nestjs');
      throw error;
    }
    return result;
  }

  async sendToTopic(
    topic: 'all' | string,
    payload: firebaseAdmin.messaging.MessagingPayload,
    silent: boolean
  ) {
    if (!topic && topic.trim().length === 0) {
      throw new Error('You provide an empty topic name!');
    }
    let result = null;
    try {
      result = await this.fcmService.sendToTopic(topic, payload, silent);
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'fcm-nestjs');
      throw error;
    }
    return result;
  }
}
