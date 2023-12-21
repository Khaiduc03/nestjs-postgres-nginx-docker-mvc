import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  createBadRequsetNoMess,
  createSuccessResponse,
  throwDataError,
} from 'src/common';
import { AuthGuard } from 'src/core';
import { FollowerService } from './follower.service';
import { API_URL } from 'src/environments';
import { CreateFollowingDTO, DeleteFollowerDTO } from './dto';
import { isUUID } from 'class-validator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller(`${API_URL}/follower`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class FollowerController {
  constructor(private followerService: FollowerService) {}

  @Post()
  @ApiBody({
    type: CreateFollowingDTO,
  })
  async createFollowing(
    @Req() req: Request,
    @Body() follower_uuid: CreateFollowingDTO
  ): Promise<any> {
    const { uuid } = req['user'];
    if (!isUUID(follower_uuid.follower_uuid)) {
      return createBadRequsetNoMess('Invalid uuid');
    }
    const response = await this.followerService.createFollowing(
      uuid,
      follower_uuid.follower_uuid
    );

    return response;
  }

  @Get()
  async getAllFollowers(@Req() req: Request): Promise<any> {
    const { uuid } = req['user'];
    const response = await this.followerService.getYourFollowers(uuid);
    return response;
  }

  @Delete()
  @ApiBody({
    type: DeleteFollowerDTO,
  })
  async deleteFollower(
    @Req() req: Request,
    @Body() following_uuid: DeleteFollowerDTO
  ): Promise<any> {
    const { uuid } = req['user'];
    if (!isUUID(following_uuid.following_uuid)) {
      return createBadRequsetNoMess('Invalid uuid');
    }
    const response = await this.followerService.deleteFollower(
      uuid,
      following_uuid.following_uuid
    );
    return response;
  }
}
