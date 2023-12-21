import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFollowingDTO {
  @IsString()
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @Expose()
  follower_uuid: string;
}

export class DeleteFollowerDTO {
  @IsString()
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @Expose()
  following_uuid: string;
}

