import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { CreateMessageDto } from './dto';
import { MessagesService } from './messages.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller(`${API_URL}/messages`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Post()
  @ApiBody({
    type: CreateMessageDto,
  })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    createMessageDto.user_uuid = uuid;

    return await this.messageService.createMessagev2(createMessageDto);
  }

  @Get()
  async getAllMessages(@Query('conversation_uuid') conversation_uuid: string) {
    return await this.messageService.findMessagesByConversation(
      conversation_uuid
    );
  }

  @Get('panigation')
  async panigationMessages(
    @Query('conversation_uuid') conversation_uuid: string,
    @Query('page') page = 2
  ) {
    return await this.messageService.panigationMessages(
      conversation_uuid,
      page
    );
  }
}
