import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';
import { User } from './user.entity';

@Entity({
  name: History.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class History extends Base {
  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user_uuid: string;

  // @Expose()
  // @ManyToOne(() => Chapter, (chapter) => chapter.uuid)
  // @JoinColumn({ name: 'last_chapter_uuid', referencedColumnName: 'uuid' })
  // last_chapter_uuid: string;

  @Expose()
  @Column({ name: 'last_chapter_number', nullable: true, type: 'int' })
  last_chapter_number: number;

  @Expose()
  @ManyToOne(() => Comic, (comic) => comic.uuid)
  @JoinColumn({ name: 'comic_uuid', referencedColumnName: 'uuid' })
  comic_uuid: string;

  constructor(history: Partial<History>) {
    super(); // call constructor of BaseEntity
    if (history) {
      Object.assign(
        this,
        plainToClass(History, history, { excludeExtraneousValues: true })
      );
      this.uuid = history.uuid || uuids4();
    }
  }
}
