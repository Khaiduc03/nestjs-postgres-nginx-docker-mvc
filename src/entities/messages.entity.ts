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
import { Conversation } from './conversation.entity';
import { MessageType } from './types';

@Entity({
  name: Message.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Message {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Expose()
  @Column({ type: 'text', default: '' })
  message: string;

  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({
    name: 'user_uuid',
    referencedColumnName: 'uuid',
  })
  user_uuid: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.uuid)
  @JoinColumn({
    name: 'conversation_uuid',
    referencedColumnName: 'uuid',
  })
  conversation_uuid: string;

  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  is_seen: boolean;

  @Expose()
  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.MESSAGE,
    nullable: true,
  })
  type: MessageType;

  // constructor(message: Partial<Message>) {
  //   if (message) {
  //     Object.assign(
  //       this,
  //       plainToClass(Message, message, { excludeExtraneousValues: true })
  //     );
  //     this.uuid = message.uuid;
  //   }
  // }
}
