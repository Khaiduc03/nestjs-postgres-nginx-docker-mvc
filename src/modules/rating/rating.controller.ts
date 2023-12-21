import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto';
import { Request } from 'express';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller(`${API_URL}/rating`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}
  @Post()
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Req() req: Request
  ) {
    const user = req['user'];
    createRatingDto.user = user;
    console.log(createRatingDto);
    return await this.ratingService.createRating(createRatingDto);
  }

  @Get()
  async getAllRatingByComicUuid(
    @Req() req: Request,
    @Query('comic_uuid') comic_uuid: string
  ) {
    const user = req['user'];
    return await this.ratingService.getAllRatingByComicUuid(
      comic_uuid,
      user.uuid
    );
  }

  @Get('uuid')
  async getRatingByuuid(
    @Req() req: Request,
    @Query('rating_uuid') rating_uuid: string
  ) {
    const user = req['user'];
    return await this.ratingService.getRatingByUuid(rating_uuid, user.uuid);
  }

  @Post('like')
  async likeRating(
    @Req() req: Request,
    @Body('rating_uuid') rating_uuid: string
  ) {
    const user = req['user'];
    return await this.ratingService.likeRating(user.uuid, rating_uuid);
  }

  @Delete('unlike')
  async unlikeRating(
    @Req() req: Request,
    @Body('rating_uuid') rating_uuid: string
  ) {
    const user = req['user'];
    return await this.ratingService.unlikeRating(user.uuid, rating_uuid);
  }

  @Delete()
  async deleteRating(
    @Req() req: Request,
    @Body('rating_uuid') rating_uuid: string
  ) {
    const user = req['user'];

    return await this.ratingService.deleteRating(user.uuid, rating_uuid);
  }

  @Get('dummy')
  async createDummyRating() {
    return await this.ratingService.createDummyRating();
  }

  @Get('chart')
  async getChartRating(@Query('comic_uuid') comic_uuid: string) {
    return await this.ratingService.getChartRatingByComicUuid(comic_uuid);
  }
}
