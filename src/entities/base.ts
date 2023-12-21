import { Expose } from 'class-transformer';
import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { format } from 'date-fns';
export class Base extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  // @Expose()
  // @Column({ type: 'varchar', default: format(new Date(), 'yyyy-MM-dd HH:mm') })
  // created_at: string;

  // @Expose()
  // @Column({ type: 'varchar', default: format(new Date(), 'yyyy-MM-dd HH:mm') })
  // updated_at: string;

  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;

  @Expose()
  @Column({ type: 'varchar', default: null })
  deleted_at: string;

  constructor() {
    super();
  }
}
