import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConverstationDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
  })
  @IsString()
  joined_uuid: string;
}
