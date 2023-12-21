import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequsetNoMess,
  createSuccessResponse,
} from 'src/common';
import { Conversation } from 'src/entities';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  //create conversation
  async createConversation(
    user_uuid: string,
    joined_uuid: string
  ): Promise<Conversation> {
    try {
      const isExist = await this.conversationRepository
        .query(
          `    
SELECT
c.*,
CASE
WHEN u.uuid = '${user_uuid}' THEN u.fullname
ELSE u_j.fullname
END AS your_name,
CASE
WHEN u.uuid = '${user_uuid}' THEN u_j.fullname
ELSE u.fullname
END AS joined_name,
CASE
WHEN u.uuid = '${user_uuid}' THEN u_j.status
ELSE u.status
END AS joined_status,
CASE
WHEN u.uuid = '${user_uuid}' THEN u_j.image_url
ELSE u.image_url
END AS joined_url,
CASE
WHEN u.uuid = '${user_uuid}' THEN u.image_url
ELSE u_j.image_url
END AS your_url,
m.message,
m.created_at AS last_message_time,
CASE
WHEN m.user_uuid IS NULL THEN NULL
ELSE
    CASE
        WHEN m.user_uuid = '${user_uuid}' THEN 'You'
        ELSE u_j.fullname
    END
END AS last_sender_name,
m.is_seen
FROM
conversation c
LEFT JOIN "user" u ON c.user_uuid = u.uuid
LEFT JOIN "user" u_j ON c.joined_uuid = u_j.uuid
LEFT JOIN "message" m ON c.last_message_uuid = m.uuid
WHERE
(c.user_uuid = '${user_uuid}' AND c.joined_uuid = '${joined_uuid}') OR (c.user_uuid = '${joined_uuid}' AND c.joined_uuid = '${user_uuid}')
ORDER BY last_message_time DESC,c.created_at DESC
LIMIT 1;
`
        )
        .catch((err) => {
          console.log('err hear', err);
        });
      if (isExist.length > 0) {
        return isExist[0];
      }
      const conversation = new Conversation({
        user_uuid: user_uuid,
        joined_uuid: joined_uuid,
      });
      conversation.user_uuid = user_uuid;
      conversation.joined_uuid = joined_uuid;
      if (!conversation) return null;

      const response = await this.conversationRepository.save(conversation);
      const QUERRY = await this.conversationRepository
        .query(
          `    
SELECT
c.*,
CASE
WHEN u.uuid = '${response.user_uuid}' THEN u.fullname
ELSE u_j.fullname
END AS your_name,
CASE
WHEN u.uuid = '${response.user_uuid}' THEN u_j.fullname
ELSE u.fullname
END AS joined_name,
CASE
WHEN u.uuid = '${response.user_uuid}' THEN u_j.status
ELSE u.status
END AS joined_status,
CASE
WHEN u.uuid = '${response.user_uuid}' THEN u_j.image_url
ELSE u.image_url
END AS joined_url,
CASE
WHEN u.uuid = '${response.user_uuid}' THEN u.image_url
ELSE u_j.image_url
END AS your_url,
m.message,
m.created_at AS last_message_time,
CASE
WHEN m.user_uuid IS NULL THEN NULL
ELSE
    CASE
        WHEN m.user_uuid = '${response.user_uuid}' THEN 'You'
        ELSE u_j.fullname
    END
END AS last_sender_name,
m.is_seen
FROM
conversation c
LEFT JOIN "user" u ON c.user_uuid = u.uuid
LEFT JOIN "user" u_j ON c.joined_uuid = u_j.uuid
LEFT JOIN "message" m ON c.last_message_uuid = m.uuid
WHERE
(c.user_uuid = '${response.user_uuid}' AND c.joined_uuid ='${response.joined_uuid}') OR (c.user_uuid = '${response.joined_uuid}' AND c.joined_uuid = '${response.user_uuid}')
ORDER BY last_message_time DESC,c.created_at DESC
LIMIT 1;
`
        )
        .catch((err) => {
          console.log('err hear1', err);
        });
      return QUERRY[0];
    } catch (error) {
      return error;
    }
  }

  //get conversation

  async getAllConversationOfUser(user_uuid: string) {
    const conversation = await this.conversationRepository.query(`
    SELECT
    c.*,
    CASE
        WHEN u.uuid = '${user_uuid}' THEN u.fullname
        ELSE u_j.fullname
    END AS your_name,
    CASE
        WHEN u.uuid = '${user_uuid}' THEN u_j.fullname
        ELSE u.fullname
    END AS joined_name,
    CASE
    WHEN u.uuid = '${user_uuid}' THEN u_j.status
    ELSE u.status
END AS joined_status,
    CASE
        WHEN u.uuid = '${user_uuid}' THEN u_j.image_url
        ELSE u.image_url
    END AS joined_url,
    CASE
        WHEN u.uuid = '${user_uuid}' THEN u.image_url
        ELSE u_j.image_url
    END AS your_url,
    m.message,
    m.created_at AS last_message_time,
    CASE
        WHEN m.user_uuid IS NULL THEN NULL
        ELSE
            CASE
                WHEN m.user_uuid = '${user_uuid}' THEN 'You'
                ELSE u_j.fullname
            END
    END AS last_sender_name,
   CASE 
      WHEN m.user_uuid = '${user_uuid}' THEN TRUE
      ELSE m.is_seen
    END AS is_seen
FROM
    conversation c
LEFT JOIN "user" u ON c.user_uuid = u.uuid
LEFT JOIN "user" u_j ON c.joined_uuid = u_j.uuid
LEFT JOIN "message" m ON c.last_message_uuid = m.uuid
WHERE 
    c.user_uuid = '${user_uuid}' OR c.joined_uuid = '${user_uuid}'
    ORDER BY m.created_at ASC;
    `);
    return conversation;
  }

  //get conversation by uuid
  async getConversationByUuid(
    uuid: string,
    last_message_uuid: string
  ): Promise<Conversation> {
    const conversation: Conversation[] = await this.conversationRepository
      .query(`
    SELECT * FROM "conversation" WHERE "uuid" = '${uuid}' limit 1;
    `);
    conversation[0].last_message_uuid = last_message_uuid;
    const res = await this.conversationRepository.save(conversation[0]);
    return res;
  }

  //update last message conversation
  async updateConversation(
    uuid: string,
    last_message_uuid: string
  ): Promise<Http> {
    const update: UpdateResult = await this.conversationRepository.update(
      { uuid },
      { last_message_uuid }
    );
    if (update['affected'] === 0) {
      return createBadRequsetNoMess('Update conversation fail');
    }
    return createSuccessResponse('Update last message', 'Update');
  }

  async deleteConversation(uuid: string) {
    const response: DeleteResult = await this.conversationRepository.delete({
      uuid,
    });

    if (response['affected'] === 0) {
      return createBadRequsetNoMess('Delete conversation fail');
    }
    return createSuccessResponse('Delete last message', 'Delete');
  }
}
