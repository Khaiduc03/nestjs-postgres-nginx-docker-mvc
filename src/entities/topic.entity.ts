import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';

@Entity({
  name: Topic.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Topic extends Base {
  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    default: '',
    nullable: true,
  })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 500, default: '', nullable: true })
  description: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
  })
  image_url: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: '',
  })
  public_id: string;

  @ManyToMany(() => Comic, (comic) => comic.uuid, {
    cascade: true,
  })
  @JoinTable({
    name: 'comic_topic',
    joinColumn: { name: 'topic_uuid', referencedColumnName: 'uuid' },
    inverseJoinColumn: { name: 'comic_uuid', referencedColumnName: 'uuid' },
  })
  comic: Comic[];

  constructor(topic: Partial<Topic>) {
    super();
    if (topic) {
      Object.assign(
        this,
        plainToClass(Topic, topic, {
          excludeExtraneousValues: true,
        })
      );
      this.uuid = topic.uuid || uuids4();
    }
  }
}
