import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTService } from 'src/configs';
import { Chapter, Comic, Image, Topic } from 'src/entities';
import { CloudService } from '../cloud';
import { ImageService } from '../image';
import { TopicService } from '../topic';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comic, Topic, Image, Chapter])],
  providers: [
    ComicService,
    CloudService,
    JWTService,
    JwtService,
    ImageService,
    TopicService,
  ],
  controllers: [ComicController],
  exports: [
    ComicService,
    CloudService,
    JWTService,
    JwtService,
    TopicService,
    TypeOrmModule,
    ImageService,
    // ChapterService,
  ],
})
export class ComicModule {}
