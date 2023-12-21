import { Module } from '@nestjs/common';
import { JoinedConversationService } from './joined-conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinedConversation } from 'src/entities/joined-conversation.entity';

@Module({
  providers: [JoinedConversationService],
  imports: [TypeOrmModule.forFeature([JoinedConversation])],
  exports: [JoinedConversationService],
})
export class JoinedConversationModule {}
