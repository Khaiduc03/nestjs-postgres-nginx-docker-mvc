import { Expose, plainToClass } from 'class-transformer';

import { uuids4 } from 'src/utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Forum } from './forum.entity';

@Entity({
  name: Forum_image.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Forum_image extends Base {
  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  public_id: string;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  url: string;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  secure_url: string;

  @Expose()
  @ManyToOne(() => Forum, (forum) => forum.uuid, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'forum_uuid', referencedColumnName: 'uuid' })
  forum_uuid: string;

  constructor(forumImage: Partial<Forum_image>) {
    super();
    if (forumImage) {
      Object.assign(
        this,
        plainToClass(Forum_image, forumImage, { excludeExtraneousValues: true })
      );
      this.uuid = forumImage.uuid || uuids4();
    }
  }
}
