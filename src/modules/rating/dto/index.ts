import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Rating, User } from 'src/entities';

export class CreateRatingDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_uuid: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
  })
  @IsString()
  rating: number;

  @Expose()
  @ApiProperty({
    type: String,
  })
  comment: string;

  @Expose()
  @ApiProperty({
    type: User,
  })
  user: User;
}

export class CreateRatingResponse {
  uuid: string;

  created_at: string;

  updated_at: string;

  deleted_at: string;

  comic_uuid: string;

  user_uuid: string;

  comment: string;

  rating: number;

  user_fullname: string;

  user_avatar: string;

  is_like: boolean;

  like_count: number;

  constructor(rating: Partial<Rating>, user: User) {
    this.uuid = rating.uuid;
    this.created_at = rating.created_at;

    this.updated_at = rating.updated_at;
    this.deleted_at = rating.deleted_at;
    this.comic_uuid = rating.comic_uuid;
    this.comic_uuid = rating.comic_uuid;
    this.user_uuid = rating.user_uuid;
    this.comment = rating.comment;
    this.rating = rating.rating;
    this.user_fullname = user.fullname;

    this.user_avatar = user.image_url;

    this.is_like = false;

    this.like_count = 0;
  }
}
