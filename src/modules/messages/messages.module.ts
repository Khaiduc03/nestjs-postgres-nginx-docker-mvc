import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/entities/messages.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { JWTService } from 'src/configs';
import { JwtService } from '@nestjs/jwt';
import { Conversation } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  controllers: [MessagesController],
  providers: [MessagesService, JWTService, JwtService],
  exports: [MessagesService, JWTService, JwtService],
})
export class MessagesModule {}
