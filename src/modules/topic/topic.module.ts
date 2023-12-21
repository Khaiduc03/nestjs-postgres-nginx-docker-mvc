import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTService } from 'src/configs';
import { Topic } from 'src/entities/topic.entity';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { CloudService } from '../cloud';

@Module({
  imports: [TypeOrmModule.forFeature([Topic])],
  controllers: [TopicController],
  providers: [TopicService, JWTService, JwtService, CloudService],
})
export class TopicModule {}
