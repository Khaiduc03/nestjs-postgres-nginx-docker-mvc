import { ParseIntPipe } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { type } from 'os';

export class CreateComicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_name: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  author: string;

  @IsNotEmpty()
  @ApiProperty({
    type: [String],
  })
  topics: string[];

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: any;
}

export class UpdateComicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_name: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  author: string;

  @IsNotEmpty()
  @ApiProperty({
    type: [String],
  })
  topics: string[];

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  description: string;
}

export class DeleteComicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: [String],
  })
  @IsString()
  uuid: string[];
}

export class UuidComicDTO {
  @ApiProperty({
    type: String,
  })
  uuid: string;
}

export class GetComicByTopicDTO {
  @ApiProperty({
    type: [String],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  topic_name: string[];
  @ApiProperty({
    type: Number,
  })
  page: number;
}

export class GetComicsByNameDTO {
  @ApiProperty({
    type: String,
  })
  comic_name: string;

  @ApiProperty({
    type: Number,
  })
  page: number;
}

export class UpdateAvatarComicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: any;
}
