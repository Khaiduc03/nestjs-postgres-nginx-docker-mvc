import { Expose, plainToClass } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from './base';
import { User } from './user.entity';
import { Message } from './messages.entity';

@Entity({
  name: Conversation.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Conversation {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;
  @ManyToOne(() => Message, (message) => message.uuid)
  @JoinColumn({
    name: 'last_message_uuid',
    referencedColumnName: 'uuid',
  })
  last_message_uuid: string;

  // @Expose()
  // @Column({ type: 'boolean', default: false })
  // status: boolean;

  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({
    name: 'user_uuid',
    referencedColumnName: 'uuid',
  })
  user_uuid: string;

  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({
    name: 'joined_uuid',
    referencedColumnName: 'uuid',
  })
  joined_uuid: string;

  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  constructor(conversation: Partial<Conversation>) {
    // call constructor of BaseEntity
    if (conversation) {
      Object.assign(
        this,
        plainToClass(Conversation, conversation, {
          excludeExtraneousValues: true,
        })
      );
      this.uuid = conversation.uuid;
    }
  }
}
