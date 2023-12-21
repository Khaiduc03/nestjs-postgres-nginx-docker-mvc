import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from 'src/entities';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { Forum_image } from 'src/entities/forum_image.entity';
import { CloudService } from '../cloud';
import { JWTService } from 'src/configs';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, Forum_image])],
  controllers: [ForumController],
  providers: [ForumService, CloudService, JWTService, JwtService],
  exports: [ForumService, CloudService, JWTService, JwtService],
})
export class ForumModule {}
