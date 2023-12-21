import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard, RolesGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { CreateForumDTO, LikeForumDTO } from './dto';
import { ForumService } from './forum.service';
import { isUUID } from 'class-validator';
import { createBadRequsetNoMess } from 'src/common';
import { Roles } from 'src/core/guards/roles.decorator';
import { UserRole } from 'src/entities';

@Controller(`${API_URL}/forum`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiBody({
    type: CreateForumDTO,
  })
  async createForum(
    @Body() createForumDTO: CreateForumDTO,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const user = req['user'];
    createForumDTO.user = user;
    createForumDTO.images = files;
    return await this.forumService.createNewPost(createForumDTO);
  }

  @Get()
  async getAllPostForums(@Query('page') page = 1, @Req() req: Request) {
    const { uuid } = req['user'];
    return await this.forumService.getAllPostForums(page, uuid);
  }

  @Get('v2')
  async getAllPostForumsv2(@Query('page') page = 1) {
    return await this.forumService.getAllPostForumsv2(page);
  }

  @Get('user')
  async getAllPostForumsOfUser(@Query('page') page = 1, @Req() req: Request) {
    const { uuid } = req['user'];
    return await this.forumService.getAllPostForumsOfUser(page, uuid);
  }

  @Get('by-user-uuid')
  async getAllPostForumsByUserUuid(
    @Query('page') page = 1,
    @Query('user_uuid') user_uuid: string
  ) {
    if (!isUUID(user_uuid)) return createBadRequsetNoMess('Invalid user uuid');

    return await this.forumService.getAllPostForumsOfUser(page, user_uuid);
  }

  @Get('uuid')
  async getForumByUuid(
    @Query('post_uuid') post_uuid: string,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    return await this.forumService.getPostForumByUuid(post_uuid, uuid);
  }

  @Post('like')
  @ApiBody({
    type: LikeForumDTO,
  })
  async likeForum(@Body() likeForumDTO: LikeForumDTO, @Req() req: Request) {
    const { uuid } = req['user'];
    return await this.forumService.likePostForum(uuid, likeForumDTO.forum_uuid);
  }

  @Delete('unlike')
  @ApiBody({
    type: LikeForumDTO,
  })
  async unLike(@Body() likeForumDTO: LikeForumDTO, @Req() req: Request) {
    const { uuid } = req['user'];
    return await this.forumService.unlikePostFourm(
      uuid,
      likeForumDTO.forum_uuid
    );
  }

  @Delete('delete-post')
  @ApiBody({
    type: LikeForumDTO,
  })
  async deletePost(@Body() likeForumDTO: LikeForumDTO, @Req() req: Request) {
    const { uuid } = req['user'];
    return await this.forumService.deletePostForum(
      likeForumDTO.forum_uuid,
      uuid
    );
  }

  @Delete('delete-post-by-admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({
    type: LikeForumDTO,
  })
  async deletePostByAdmin(@Body() likeForumDTO: LikeForumDTO) {
    return await this.forumService.deletePostForumByAdmin(
      likeForumDTO.forum_uuid
    );
  }

  @Get('dummy')
  async dummy() {
    return await this.forumService.createDummyForum();
  }
}
