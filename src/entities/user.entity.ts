import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Base } from './base';
import { Gender, UserRole } from './types';
import { Wallet } from './wallet.entity';

@Entity({
  name: User.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class User extends Base {
  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  email: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  password: string;

  @Expose()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  roles: UserRole;

  @Expose()
  @Column({ type: 'varchar', length: 255, default: '' })
  fullname: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  summary: string;

  @Expose()
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Expose()
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Expose()
  @Column({ type: 'date', nullable: true })
  dob: string;

  @Expose()
  @Column({ type: 'varchar', default: '', nullable: true })
  device_token: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, nullable: true, default: '' })
  image_url: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, nullable: true, default: '' })
  public_id: string;

  @Expose()
  @OneToOne(() => Wallet, (wallet) => wallet.uuid)
  @JoinColumn({ name: 'wallet_uuid', referencedColumnName: 'uuid' })
  wallet: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  isUpdate: boolean;

  @Expose()
  @Column({ type: 'boolean', default: false })
  isPassword: boolean;

  @Expose()
  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  constructor(user: Partial<User>) {
    super(); // call constructor of BaseEntity
    if (user) {
      Object.assign(
        this,
        plainToClass(User, user, { excludeExtraneousValues: true })
      );
      this.uuid = user.uuid;
    }
  }
}
