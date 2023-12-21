import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto';
import {
  Http,
  createBadRequsetNoMess,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { isUUID } from 'class-validator';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  async createMessage(message: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create(message);
    //newMessage.user = message.user_uuid;
    //newMessage.conversation_uuid = message.conversation_uuid;
    const res = await this.messageRepository.save(newMessage);

    return res;
  }

  async createMessagev2(message: CreateMessageDto): Promise<Http> {
    const newMessage = this.messageRepository.create(message);
    //newMessage.user = message.user_uuid;
    //newMessage.conversation_uuid = message.conversation_uuid;
    const res = await this.messageRepository.save(newMessage);
    if (!res) {
      return createBadRequsetNoMess('Send message fail');
    }
    await this.conversationRepository.update(message.conversation_uuid, {
      last_message_uuid: res.uuid,
    });
    return createSuccessResponse(res, 'Send message success');
  }

  //   async findMessagesByConversation(
  //     conversation_uuid: string,
  //     user_uuid: string
  //   ): Promise<Message[]> {
  //     const query = await this.messageRepository.query(`
  //    SELECT m.*,
  //    CASE
  //      WHEN u.uuid != '${user_uuid}' THEN u.fullname
  //      ELSE null
  //      END AS sender_name,
  //    CASE
  //      WHEN u.uuid != '${user_uuid}' THEN u.image_url
  //      ELSE null
  //      END AS sender_image
  //  FROM "message" m
  //  LEFT JOIN "user" u ON u.uuid = m.user_uuid
  //  WHERE "conversation_uuid" = '${conversation_uuid}'
  //  ORDER BY m.created_at DESC;
  //    `);
  //     return query;
  //   }

  async panigationMessages(conversation_uuid: string, page = 2) {
    console.log(page);
    const totalItem = await this.messageRepository.query(`
    SELECT COUNT(*) AS total
    FROM message
    WHERE conversation_uuid = '${conversation_uuid}';`);

    const query = await this.messageRepository.query(`
    SELECT m.*
    FROM "message" m 
    WHERE "conversation_uuid" = '${conversation_uuid}'
    ORDER BY m.created_at DESC
    LIMIT 18 OFFSET ${(page - 1) * 18};
    `);

    const data = panigationData(page, query, Number(totalItem[0]['total']));
    return data;
  }

  //   async findMessagesByConversation(
  //     conversation_uuid: string,
  //     user_uuid: string
  //   ): Promise<Message[]> {
  //     const query = await this.messageRepository.query(`
  //    SELECT m.*,
  //    CASE
  //      WHEN u.uuid != '${user_uuid}' THEN u.fullname
  //      ELSE null
  //      END AS sender_name,
  //    CASE
  //      WHEN u.uuid != '${user_uuid}' THEN u.image_url
  //      ELSE null
  //      END AS sender_image
  //  FROM "message" m
  //  LEFT JOIN "user" u ON u.uuid = m.user_uuid
  //  WHERE "conversation_uuid" = '${conversation_uuid}'
  //  ORDER BY m.created_at DESC;
  //    `);
  //     return query;
  //   }

  async findMessagesByConversation(
    conversation_uuid: string,
    last_message_uuid?: string
  ): Promise<Message[]> {
    const query = await this.messageRepository.query(`
 SELECT m.*
FROM "message" m 
WHERE "conversation_uuid" = '${conversation_uuid}'
ORDER BY m.created_at DESC
LIMIT 18 OFFSET 0;
 `);
    return query;
  }

  async updateSeenMessage(
    user_uuid: string,
    last_message_uuid: string,
    conversation_uuid: string
  ) {
    try {
      console.log('hi');
      if (user_uuid && isUUID(last_message_uuid)) {
        const checkUser = await this.messageRepository.query(`
          SELECT * FROM "message" WHERE "uuid" = '${last_message_uuid}';
        `);
        console.log(checkUser);
        console.log('hi');
        if (checkUser.length > 0) {
          if (checkUser[0]['user_uuid'] === user_uuid) {
            console.log('hi2');
            return false;
          } else {
            console.log('hi3');
            await this.messageRepository.query(`
            UPDATE "message" SET "is_seen" = true WHERE "conversation_uuid" = '${conversation_uuid}';
            `);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async uppdateMessageStatusByUuid(message_uuid: string) {
    try {
      this.messageRepository.query(`
      UPDATE "message" SET "is_seen" = true WHERE "uuid" = '${message_uuid}';
      `);
    } catch (error) {
      console.log(error);
    }
  }
}
