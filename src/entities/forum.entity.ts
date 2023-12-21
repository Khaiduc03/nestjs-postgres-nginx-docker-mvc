import { Expose, plainToClass } from 'class-transformer';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Base } from './base';
import { User } from './user.entity';
import { uuids4 } from 'src/utils';

@Entity({
  name: Forum.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Forum extends Base {
  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({
    name: 'user_uuid',
    referencedColumnName: 'uuid',
  })
  user_uuid: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  content: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Expose()
  @ManyToMany(() => User, (user) => user.uuid, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'forum_like',
    joinColumn: {
      name: 'forum_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
    },
  })
  likes: User[];

  constructor(forum: Partial<Forum>) {
    super();
    if (forum) {
      Object.assign(
        this,
        plainToClass(Forum, forum, {
          excludeExtraneousValues: true,
        })
      );
      this.uuid = forum.uuid || uuids4();
    }
  }
}
