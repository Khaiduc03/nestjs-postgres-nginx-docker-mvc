import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedConversation } from 'src/entities/joined-conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedConversationService {
  constructor(
    @InjectRepository(JoinedConversation)
    private readonly joinedConversationRepository: Repository<JoinedConversation>
  ) {}

  async addJoinedToConversation(
    socket_id: string,
    user_uuid: string,
    conversation_uuid: string
  ) {
    try {
      // const isExist = await this.joinedConversationRepository.query(`
      // SELECT * FROM "joined_conversation" WHERE "user_uuid" = '${user_uuid}' AND "conversation_uuid" = '${conversation_uuid}'
      // `);
      // if (isExist.length > 0) {
      //   return isExist[0];
      // }

      const newJoinedConversation = this.joinedConversationRepository.create({
        user_uuid: user_uuid,
        conversation_uuid: conversation_uuid,
        socket_id: socket_id,
      });
      const res = await this.joinedConversationRepository.save(
        newJoinedConversation
      );
      //console.log(res);
      return res;
    } catch (error) {
      console.log('error at created joined',error.message);
    }
  }

  async getAllJoinedByConversation(conversation_uuid: string) {
    const res = await this.joinedConversationRepository.query(`
    SELECT * FROM "joined_conversation" WHERE "conversation_uuid" = '${conversation_uuid}'
    `);
    return res;
  }

  async deleteBySocketId(socket_id: string) {
    const res = await this.joinedConversationRepository.delete({
      socket_id: socket_id,
    });
    if (res.affected === 0) {
      return false;
    }
    return res;
  }

  async deleteAll() {
    await this.joinedConversationRepository
      .createQueryBuilder()
      .delete()
      .execute();
  }
}
