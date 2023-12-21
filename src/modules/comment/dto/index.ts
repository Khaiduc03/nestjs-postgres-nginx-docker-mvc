import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentChapterDTO {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  chapter_uuid: string;

  user_uuid: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  parents_comment_uuid?: string;
}

export class CreateCommentForumDTO {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  forum_uuid: string;

  user_uuid: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  parents_comment_uuid?: string;
}

export class GetAllCommentDTO {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  chapter_uuid: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  user_uuid: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  parents_comment_uuid?: string;
}

export class UpdateCommentDTO {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}

// export class DeleteCommentDTO {
//   @ApiProperty({
//     type: String,
//   })
//   @IsNotEmpty()
//   @IsString()
//   user_uuid: string;
// }
