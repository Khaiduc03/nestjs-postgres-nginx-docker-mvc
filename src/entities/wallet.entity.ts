import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: Wallet.name.toLowerCase(),
})
export class Wallet {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Expose()
  @Column({ type: 'float' })
  amount: number;

  constructor(wallet: Partial<Wallet>) {
    if (wallet) {
      Object.assign(
        this,
        plainToClass(Wallet, wallet, { excludeExtraneousValues: true })
      );
      this.uuid = wallet.uuid || uuids4();
    }
  }
}
