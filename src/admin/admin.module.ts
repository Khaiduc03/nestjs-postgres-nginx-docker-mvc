import { Module } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { JWTService } from 'src/configs';
import { ModulesApiModule } from 'src/modules/modules.module';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [JWTService, JwtService],
  imports: [ModulesApiModule],
})
export class AdminModule {}
