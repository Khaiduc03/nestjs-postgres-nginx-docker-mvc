import { Expose, plainToClass } from 'class-transformer';

import { uuids4 } from 'src/utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';

@Entity({
  name: Banner.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Banner extends Base {
  @Expose()
  @ManyToOne(() => Comic, (comic) => comic.uuid)
  @JoinColumn({ name: 'comic_uuid', referencedColumnName: 'uuid' })
  comic: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  image_url: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  public_id: string;

  constructor(banner: Partial<Banner>) {
    super();
    if (Banner) {
      Object.assign(
        this,
        plainToClass(Banner, banner, { excludeExtraneousValues: true })
      );
      this.uuid = banner.uuid || uuids4();
    }
  }
}
