import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { User } from './user.entity';

@Entity({
  name: Follower.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Follower extends Base {
  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'following_uuid', referencedColumnName: 'uuid' })
  following_uuid: string;

  @Expose()
  @ManyToOne(() => User, (user) => user.uuid)
  @JoinColumn({ name: 'follower_uuid', referencedColumnName: 'uuid' })
  follower_uuid: string;

  constructor(follower: Partial<Follower>) {
    super(); // call constructor of BaseEntity
    if (follower) {
      Object.assign(
        this,
        plainToClass(Follower, follower, { excludeExtraneousValues: true })
      );
      this.uuid = follower.uuid || uuids4();
    }
  }
}
