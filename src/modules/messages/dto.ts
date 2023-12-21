import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/entities';

export class CreateMessageDto {
  @ApiProperty({
    type: String,
  })
  message: string;

  @ApiProperty({
    type: String,
  })
  user_uuid: string;

  @ApiProperty({
    type: String,
  })
  conversation_uuid: string;

  @ApiProperty({
    type: String,
  })
  type: MessageType;
}
