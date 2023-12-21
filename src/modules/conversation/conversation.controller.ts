import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  Http,
  createBadRequset,
  createSuccessResponse,
  throwDataError,
} from 'src/common';
import { Request } from 'express';
import { CreateConverstationDTO } from './dto';
import { API_URL } from 'src/environments';
import { AuthGuard } from 'src/core';
import { isUUID } from 'class-validator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller(`${API_URL}/conversation`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  @ApiBody({
    type: CreateConverstationDTO,
  })
  async createConverstation(
    @Req() req: Request,
    @Body() createConverstationDTO: CreateConverstationDTO
  ): Promise<Http> {
    const { uuid } = req['user'];
    if (!isUUID(createConverstationDTO.joined_uuid) === false)
      createBadRequset('Create Converstation');

    const response = await this.conversationService.createConversation(
      uuid,
      createConverstationDTO.joined_uuid
    );
    throwDataError(response, 'Create Converstation');
    return createSuccessResponse(response, 'Create converstation');
  }

  @Get()
  async getAllConverationOfUser(@Req() req: Request) {
    const { uuid } = req['user'];

    const response = await this.conversationService.getAllConversationOfUser(
      uuid
    );

    return createSuccessResponse(response, 'Get all conversation');
  }
}
