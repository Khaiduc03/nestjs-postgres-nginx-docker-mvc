import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from 'src/entities';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { CloudService } from '../cloud';
import { JWTService } from 'src/configs';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [ImageController],
  providers: [ImageService, CloudService, JWTService, JwtService],
})
export class ImageModule {}
