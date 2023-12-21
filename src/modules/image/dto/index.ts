import { UploadedFile } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class uuidImage {
  @Expose()
  //@IsUUID()
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  uuid: string;
}

export class CreateImageDTO {
  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  folder: string;
}

export class getImagesDTO {
  @Expose()
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  tag: string;
}
