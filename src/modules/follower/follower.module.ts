import { Module } from '@nestjs/common';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follower, User } from 'src/entities';
import { JwtService } from '@nestjs/jwt';
import { JWTService } from 'src/configs';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follower])],
  controllers: [FollowerController],
  providers: [FollowerService, JWTService, JwtService],
})
export class FollowerModule {}
