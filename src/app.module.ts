import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CacheService, MailerConfigModule, TypeOrmService } from './configs';

import { FcmModule } from '@doracoder/fcm-nestjs';
import { AuthModule } from './auth';

import { RedisModule } from '@liaoliaots/nestjs-redis';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { NODE_ENV } from './environments';
import { ModulesApiModule } from './modules/modules.module';

import { EventModule } from './event/event.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmService,
    }),

    CacheModule.registerAsync({
      useClass: CacheService,
    }),
    RedisModule.forRoot({
      readyLog: true,
      config: {
        port: 6379,
        host: 'redis',
      },
    }),

    FcmModule.forRoot({
      firebaseSpecsPath:
        NODE_ENV === 'development'
          ? join(__dirname, '../services-account.json')
          : join(__dirname, './services-account.json'),
    }),

    AuthModule,

    MailerConfigModule,
    ModulesApiModule,
    AdminModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
