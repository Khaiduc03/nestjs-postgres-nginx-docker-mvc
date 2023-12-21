import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChapterDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  chapter_name: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  chapter_number: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  tag: string;
}

export class UpdateChapterDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  chapter_name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  chapter_number: string;
}

export class UuidComicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_uuid: string;
}

export class UuidChapterDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  uuid: string;
}

export class DeleteChapterDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  comic_uuid: string;
}
