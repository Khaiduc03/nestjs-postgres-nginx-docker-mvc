import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class JoinedConversation {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  socket_id: string;

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
}
