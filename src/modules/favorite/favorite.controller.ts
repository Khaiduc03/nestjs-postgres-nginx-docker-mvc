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
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { Http, createBadRequset } from 'src/common';
import { FavoriteService } from './favorite.service';
import { API_URL } from 'src/environments';
import { AuthGuard } from 'src/core';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller(`${API_URL}/favorite`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Get('check')
  async checkFavorite(
    @Query('comic_uuid') comic_uuid: string,
    @Req() req: Request
  ): Promise<Http> {
    if (!isUUID(comic_uuid)) return createBadRequset('comic_uuid is not uuid');
    const { uuid } = req['user'];
    return await this.favoriteService.checkFavorite(uuid, comic_uuid);
  }

  @Get()
  async getAllComicUserWasFavorite(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<Http> {
    const { uuid } = req['user'];
    return await this.favoriteService.getAllComicUserWasFavorite(uuid, page);
  }

  @Post()
  async createFavorite(
    @Body('comic_uuid') comic_uuid: string,
    @Req() req: Request
  ): Promise<Http> {
    if (!isUUID(comic_uuid)) return createBadRequset('comic_uuid is not uuid');
    const { uuid } = req['user'];
    return await this.favoriteService.addFavorite(uuid, comic_uuid);
  }

  @Get('dummy')
  async dummy(): Promise<Http> {
    return await this.favoriteService.createDummyFavorite();
  }
}
