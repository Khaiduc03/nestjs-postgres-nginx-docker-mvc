import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';
import { User } from './user.entity';
import { Max, Min } from 'class-validator';

@Entity({
  name: Rating.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Rating extends Base {
  @Expose()
  @Column({ type: 'int', nullable: false })
  rating: number;

  @Expose()
  @ManyToOne(() => Comic, (comic) => comic.uuid)
  @JoinColumn({ name: 'comic_uuid', referencedColumnName: 'uuid' })
  comic_uuid: string;

  @Expose()
  @ManyToOne(() => User, (comic) => comic.uuid)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user_uuid: string;

  @Expose()
  @Column({ type: 'varchar', length: 400, nullable: true })
  comment?: string;

  @Expose()
  @ManyToMany(() => User, (user) => user.uuid)
  @JoinTable({
    name: 'rating_like',
    joinColumn: {
      name: 'rating_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
    },
  })
  likes: string[];

  constructor(rating: Partial<Rating>) {
    super();
    if (rating) {
      Object.assign(
        this,
        plainToClass(Rating, rating, {
          excludeExtraneousValues: true,
        })
      );
      this.uuid = rating.uuid || uuids4();
    }
  }
}
