import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTService } from 'src/configs';
import { RedisManagerService } from 'src/core';
import { Comic, History, Image, Topic } from 'src/entities';
import { Chapter } from 'src/entities/chapter.entity';
import { CloudService } from '../cloud';
import { ComicService } from '../comic';
import { ImageService } from '../image';
import { TopicService } from '../topic';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { HistoryService } from '../history/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Image, Comic, Topic, History])],
  controllers: [ChapterController],
  providers: [
    ChapterService,
    ImageService,
    CloudService,
    JWTService,
    JwtService,
    ComicService,
    TopicService,
    RedisManagerService,
    HistoryService,
  ],
  exports: [
    ChapterService,
    ImageService,
    CloudService,
    JWTService,
    JwtService,
    ComicService,
    TopicService,
    TypeOrmModule,
  ],
})
export class ChapterModule {}
