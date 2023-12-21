import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHistoryDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: Number,
  })
  last_chapter_number: number;
}
