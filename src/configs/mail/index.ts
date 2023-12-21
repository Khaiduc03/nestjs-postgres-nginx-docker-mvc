import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import {
  MAILER_HOST,
  MAILER_HOST_PASSWORD,
  MAILER_HOST_USER,
  MAILER_PORT,
} from 'src/environments';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: MAILER_HOST,
          port: MAILER_PORT,
          secure: false,
          pool: false,
          tls: {
            rejectUnauthorized: false,
          },

          auth: {
            user: MAILER_HOST_USER,
            pass: MAILER_HOST_PASSWORD,
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/template',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class MailerConfigModule {}
