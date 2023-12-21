import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Wallet } from 'src/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtService } from '@nestjs/jwt';
import { JWTService } from 'src/configs';
import { MailService } from 'src/core';
import { CloudService } from 'src/modules';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JWTService,
    WalletService,
    CloudService,
    MailService,
  ],
  exports: [
    AuthService,
    JwtService,
    JWTService,
    WalletService,
    CloudService,
    MailService,
    TypeOrmModule.forFeature([User, Wallet]),
  ],
})
export class AuthModule {}
