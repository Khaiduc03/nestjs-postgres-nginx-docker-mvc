import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  isDate,
} from 'class-validator';
import { Gender } from 'src/entities';

export class GetUserDTO {
  @IsString()
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @Expose()
  uuid: string;
}

export class UpdateProfileDTO {
  @IsString()
  @ApiProperty({
    type: String,
    default: 'Quoc Dat',
  })
  @IsNotEmpty()
  @Expose()
  fullname: string;

  @IsString()
  @ApiProperty({
    type: String,
    default: '0123456789',
  })
  @IsNotEmpty()
  @Expose()
  phone: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    default: '1999-01-01',
  })
  @Expose()
  dob: string;

  //@IsBoolean()
  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({
    enum: ['male', 'female'],
  })
  @Expose()
  gender: Gender;
}

export class UpdateSummaryDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @Expose()
  summary: string;
}

export class UpdatePassword {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @Expose()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @Expose()
  newPassword: string;

  user_uuid:string
}
