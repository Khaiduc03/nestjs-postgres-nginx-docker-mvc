import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  @ApiProperty({
    type: String,
    default: 'khai@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    default: '12345678',
  })
  password: string;

  @IsString()
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  device_token: string;
}

export class LoginAdminDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  @ApiProperty({
    type: String,
    default: 'p3nhox99@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    default: '123456',
  })
  password: string;
}

export class RegisterAdminDTO {
  @IsString()
  @IsEmail()
  @Expose()
  @ApiProperty({
    type: String,
    default: 'khai@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    default: '12345678',
  })
  password: string;
}

export class RegisterUserDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  @ApiProperty({
    type: String,
    default: 'khai@gmail.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    default: '12345678',
  })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  refreshToken: string;
}
export class UpdatePasswordDTO {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    default: 'thao@gmail.com',
  })
  email: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: '12345678',
  })
  password: string;
}

export class ChangePasswordDTO {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    default: 'khai@gmail.com',
  })
  email: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: '12345678',
  })
  oldPassword: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: '123456789',
  })
  newPassword: string;
}

export class GoogleLoginDTO {
  @IsNotEmpty()
  @Expose()
  @IsString()
  @ApiProperty()
  idToken: string;

  @IsString()
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  device_token: string;
}

export class SendOTPDTO {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    default: 'thao@gmail.com',
  })
  email: string;
}

export class VerifyOTPDTO {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    default: 'thao@gmail.com',
  })
  email: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
  })
  otp: number;
}

export class BannedUserDTO {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: 'c4c2d5c2-2c8e-4b9d-8c9f-5d8e6d7f8e9f',
  })
  user_uuid: string;
}
