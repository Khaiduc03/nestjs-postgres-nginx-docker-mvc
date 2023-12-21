import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { isUUID } from 'class-validator';
import { Request } from 'express';
import { Http, createBadRequset, createSuccessResponse } from 'src/common';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import {
  GetUserDTO,
  UpdatePassword,
  UpdateProfileDTO,
  UpdateSummaryDTO,
} from './dto';
import { UserService } from './user.service';

@Controller(`${API_URL}/user`)
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<Http> {
    const response = await this.userService.getAllUsers();
    if (!response) return createBadRequset('Get all users');
    return createSuccessResponse(response, 'Get all users');
  }

  @Get('follower')
  async getAllUsersFollower(@Req() req: Request): Promise<Http> {
    const { uuid } = req['user'];
    const response = await this.userService.getFollowerUser(uuid);
    return response;
  }

  @Get('v2')
  async getAllUsersv2(@Query('page') page: number = 1): Promise<Http> {
    const response = await this.userService.getAllUsersv2(page);
    if (!response) return createBadRequset('Get all users');
    return createSuccessResponse(response, 'Get all users');
  }

  @Get('profile')
  async getProfileUser(@Req() req: Request): Promise<Http> {
    const { uuid } = req['user'];
    return await this.userService.getDetailUser(uuid);
    // const response = await this.userService.getProfileUser(uuid);
    // if (!response) return createBadRequset('Get profile user');
    // return createSuccessResponse(response, 'Get profile user');
  }

  // @Get('detail')
  // async getDetailUser(@Req() req: Request): Promise<Http> {
  //   const { uuid } = req['user'];
  //   return await this.userService.getDetailUser(uuid);
  // }

  @Get('uuid/:uuid')
  async getUserById(@Param('uuid') uuid: string): Promise<any> {
    if (!isUUID(uuid)) return createBadRequset('Get user by id');

    const response = await this.userService.getDetailUser(uuid);
    return response;
  }

  //update profile
  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfile: UpdateProfileDTO
  ): Promise<Http> {
    const user = req['user'];
    return await this.userService.updateProfile(updateProfile, user.uuid);
  }

  @Put('summary')
  async summary(
    @Req() req: Request,
    @Body() updateSumary: UpdateSummaryDTO
  ): Promise<Http> {
    const user = req['user'];
    return await this.userService.updateSummary(
      updateSumary.summary,
      user.uuid
    );
  }

  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async getAvatar(
    @Req() req: Request,
    @UploadedFile() avatar: Express.Multer.File
  ): Promise<Http> {
    const { uuid } = req['user'];
    return await this.userService.updateAvatar(uuid, avatar);
  }

  @Put('password')
  async updatePassword(
    @Req() req: Request,
    @Body() updatePassword: UpdatePassword
  ): Promise<Http> {
    const { uuid } = req['user'];
    updatePassword.user_uuid = uuid;
    return await this.userService.updatePassword(updatePassword);
  }

  @Delete('avatar')
  async deleteAvatar(@Req() req: Request): Promise<Http> {
    const { uuid } = req['user'];

    return await this.userService.deleteAvatar(uuid);
  }

  @Get('random')
  async getRandomUser(@Req() req: Request): Promise<Http> {
    const { uuid } = req['user'];
    return await this.userService.getRandomUser(uuid);
  }

  @Delete()
  async deleteUser(@Body() user: GetUserDTO): Promise<Http> {
    return await this.userService.deleteUser(user);
  }
}
