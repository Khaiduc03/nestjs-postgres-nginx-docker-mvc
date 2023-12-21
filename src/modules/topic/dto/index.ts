import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { OptionDelete } from 'src/utils';

export class CreateTopicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: 'Topic name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image_url: any;

  @ApiProperty({
    type: String,
    default: 'Topic description',
  })
  @IsString()
  description: string;
}

export class UpdateTopicDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: 'Topic Laravel 2',
  })
  @IsString()
  name: string;
}

export class DeleteTopicDTO {
  @ApiProperty({
    type: Array,
    default: '',
    description:
      'send uuids to delete multiple topic (comma-separated if multiple)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  uuids: string[];

  @ApiProperty({
    type: String,
    default: OptionDelete.ALL,
    description: 'all | uuids',
  })
  option: OptionDelete;
}
