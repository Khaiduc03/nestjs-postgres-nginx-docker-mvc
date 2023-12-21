import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Request } from 'express';
import { CreateHistoryDTO } from './dto';
import { API_URL } from 'src/environments';
import { AuthGuard } from 'src/core';
import { Http } from 'src/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller({ path: `${API_URL}/history` })
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  // @Post()
  // async createHistory(
  //   @Body() createHistoryDto: CreateHistoryDTO,
  //   @Req() req: Request
  // ) {
  //   const { uuid } = req['user'];
  //   return await this.historyService.createHistory(
  //     createHistoryDto.last_chapter_number,
  //     createHistoryDto.comic_uuid,
  //     uuid
  //   );
  // }

  @Get()
  async getAllHistory(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<Http> {
    const { uuid } = req['user'];

    return await this.historyService.getAllHistory(uuid, page);
  }
}
