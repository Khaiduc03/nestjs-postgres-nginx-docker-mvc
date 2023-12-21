import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from 'src/entities';
import { JWTService } from 'src/configs';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Comic])],
  providers: [FavoriteService, JWTService, JwtService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}
