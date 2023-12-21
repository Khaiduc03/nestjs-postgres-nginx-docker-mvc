import { Module } from '@nestjs/common';
import { ConnectedController } from './connected.controller';
import { ConnectedService } from './connected.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connected } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Connected])],
  controllers: [ConnectedController],
  providers: [ConnectedService],
  exports: [ConnectedService],
})
export class ConnectedModule {}
