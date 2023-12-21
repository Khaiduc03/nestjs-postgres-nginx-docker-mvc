import { Expose, plainToClass } from 'class-transformer';

import { uuids4 } from 'src/utils';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from './base';

import { Topic } from './topic.entity';
import { User } from './user.entity';

@Entity({
  name: Comic.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Comic extends Base {
  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  comic_name: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  author: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
    default: 'thông tin vẫn đang được cập nhập',
  })
  description: string;

  // @Expose()
  // @Column({
  //   type: 'integer',
  //   nullable: true,
  //   default: 0,
  // })
  // views: number;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  image_url: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  public_id: string;

  @Expose()
  @ManyToMany(() => Topic, (topic) => topic.uuid)
  @JoinTable({
    name: 'comic_topic',
    joinColumn: {
      name: 'comic_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'topic_uuid',
      referencedColumnName: 'uuid',
    },
  })
  topics: Topic[];

  @Expose()
  @ManyToMany(() => User, (user) => user.uuid)
  @JoinTable({
    name: 'favorite',
    joinColumn: {
      name: 'comic_uuid',
      referencedColumnName: 'uuid',
      foreignKeyConstraintName:'fk_favorite_comic_uuid'
    },
    inverseJoinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
      foreignKeyConstraintName:'fk_favorite_user_uuid'
    },
  })
  favorite: User[];

  constructor(comic: Partial<Comic>) {
    super(); // call constructor of BaseEntity
    if (comic) {
      Object.assign(
        this,
        plainToClass(Comic, comic, { excludeExtraneousValues: true })
      );
      this.uuid = comic.uuid || uuids4();
    }
  }
}
