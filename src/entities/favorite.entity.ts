import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';
import { User } from './user.entity';

@Entity({
  name: Favorite.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Favorite extends Base {
  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user_uuid: string;

  @Expose()
  @ManyToOne(() => Comic, (comic) => comic.uuid)
  @JoinColumn({ name: 'comic_uuid', referencedColumnName: 'uuid' })
  comic_uuid: string;

  constructor(favorite: Partial<Favorite>) {
    super(); // call constructor of BaseEntity
    if (favorite) {
      Object.assign(
        this,
        plainToClass(Favorite, favorite, { excludeExtraneousValues: true })
      );
      this.uuid = favorite.uuid || uuids4();
    }
  }
}
