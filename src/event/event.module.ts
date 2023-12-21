import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth';
import { EventGateway } from './event.gateway';
import { ModulesApiModule } from 'src/modules/modules.module';

@Module({
  imports: [AuthModule, ModulesApiModule],
  providers: [EventGateway],
})
export class EventModule {}
