import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Connected {
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
}
