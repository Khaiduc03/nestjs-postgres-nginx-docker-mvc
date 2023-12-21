import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTService } from 'src/configs';
import { User } from 'src/entities';
import { Conversation } from 'src/entities/conversation.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, User])],
  providers: [ConversationService, JWTService, JwtService],
  controllers: [ConversationController],
  exports: [ConversationService],
})
export class ConversationModule {}
