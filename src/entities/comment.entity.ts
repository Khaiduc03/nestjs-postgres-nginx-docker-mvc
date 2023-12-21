import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from './base';
import { Chapter } from './chapter.entity';
import { Forum } from './forum.entity';
import { User } from './user.entity';

@Entity({
  name: Comment.name.toLowerCase(),
  orderBy: {
    created_at: 'DESC',
  },
})
export class Comment extends Base {
  @Expose()
  @ManyToOne(() => Chapter, (chapter) => chapter.uuid, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_uuid', referencedColumnName: 'uuid' })
  chapter_uuid?: string;

  @Expose()
  @ManyToOne(() => Forum, (forum) => forum.uuid, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'forum_uuid', referencedColumnName: 'uuid' })
  forum_uuid?: string;

  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user_uuid: string;

  @Expose()
  @Column({ type: 'text', nullable: false })
  comment: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  parents_comment_uuid?: string;

  @Expose()
  @Column({ type: 'varchar', length: '50', nullable: false })
  type: string;

  @Expose()
  @ManyToMany(() => User, (user) => user.uuid, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'comment_like',
    joinColumn: {
      name: 'comment_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
    },
  })
  likes: User[];

  constructor(comment: Partial<Comment>) {
    super(); // call constructor of BaseEntity
    if (comment) {
      Object.assign(
        this,
        plainToClass(Comment, comment, { excludeExtraneousValues: true })
      );
      this.uuid = comment.uuid || uuids4();
    }
  }
}
