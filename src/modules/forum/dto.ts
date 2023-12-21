import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty } from 'class-validator';
import { Forum, User } from 'src/entities';

export class CreateForumDTO {
  @ApiProperty({
    type: User,
  })
  user: User;

  @ApiProperty({
    type: String,
  })
  content: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsNotEmpty()
  status: boolean;

  images: Express.Multer.File[];
}

export class ResponseForumModel {
  uuid: string;
  user_uuid: string;
  user_avatar: string | null;
  user_fullname: string | null;
  content: string;
  status: boolean;
  images: string[];
  like_count: number;
  like_uuid: string | null;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  constructor(forum: Partial<Forum>, images: string[], user: User) {
    Object.assign(this, forum);
    this.images = images;
    this.user_avatar = user.image_url;
    this.user_fullname = user.fullname;
    this.like_count = 0;
    this.like_uuid = null;
    this.is_liked = false;
  }
}

export class LikeForumDTO {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  forum_uuid: string;
}
