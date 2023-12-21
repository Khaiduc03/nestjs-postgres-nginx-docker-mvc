import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTService } from 'src/configs';
import { Follower, User } from 'src/entities';
import { CloudService } from '../cloud';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follower])],
  providers: [UserService, JWTService, JwtService, CloudService],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
