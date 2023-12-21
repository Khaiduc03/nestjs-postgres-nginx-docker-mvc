import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MAILER_FROM } from 'src/environments';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOTP(to: string, code: number): Promise<any> {
    const response = await this.mailerService.sendMail({
      to,
      from: MAILER_FROM,
      subject: 'Verify Comic Verse OTP',
      template: 'sendOTP.hbs',
      context: {
        code,
      },
    });

    return response;
  }
}
