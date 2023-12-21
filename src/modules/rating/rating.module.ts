import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic, Rating, User } from 'src/entities';
import { ComicModule, ComicService } from '../comic';
import { UserService } from '../user';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User]), ComicModule],
  controllers: [RatingController],
  providers: [RatingService, ComicService, UserService],
})
export class RatingModule {}
