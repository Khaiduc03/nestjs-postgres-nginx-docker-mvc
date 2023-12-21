import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>
  ) {}

  async createWallet(): Promise<Wallet> {
    const wallet = new Wallet({
      amount: 0,
    });
    return await this.walletRepository.save(wallet);
  }
}
