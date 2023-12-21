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
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { CommentService } from './comment.service';
import { CreateCommentChapterDTO, CreateCommentForumDTO } from './dto';
import { isUUID } from 'class-validator';
import { createBadRequset } from 'src/common';

@Controller(`${API_URL}/comment`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('chapter')
  @ApiBody({
    type: CreateCommentChapterDTO,
  })
  async createCommentChapter(
    @Body() createCommentDTO: CreateCommentChapterDTO,
    @Req() req: Request
  ): Promise<any> {
    const { uuid } = req['user'];
    createCommentDTO.user_uuid = uuid;
    return await this.commentService.createCommentChapter(createCommentDTO);
  }

  @Post('forum')
  @ApiBody({
    type: CreateCommentForumDTO,
  })
  async createCommentForum(
    @Body() createCommentDTO: CreateCommentForumDTO,
    @Req() req: Request
  ): Promise<any> {
    const { uuid } = req['user'];
    createCommentDTO.user_uuid = uuid;
    return await this.commentService.createCommentForum(createCommentDTO);
  }

  @Get('chapter')
  async getAllCommentsChapter(
    @Query('chapter_uuid') chapter_uuid: string,
    @Query('page') page = 1,
    @Req() req: Request
  ) {
    // if (!isUUID(chapter_uuid))
    //   return createBadRequset('Get all comments chapter');
    const { uuid } = req['user'];
    return await this.commentService.getAllCommentsChapter(
      chapter_uuid,
      page,
      uuid
    );
  }

  @Get('forum')
  async getAllCommentsForum(
    @Query('forum_uuid') forum_uuid: string,
    @Query('page') page = 1,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    // console.log(isUUID(forum_uuid));
    // if (!isUUID(forum_uuid)) return createBadRequset('invalid forum uuid');
    return await this.commentService.getAllCommentsForum(
      forum_uuid,
      page,
      uuid
    );
  }

  @Get('re-comment')
  async getAllReComments(
    @Query('parents_comment_uuid') parents_comment_uuid: string,
    @Query('page') page = 1,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    return await this.commentService.getAllReComments(
      parents_comment_uuid,
      page,
      uuid
    );
  }

  @Post('like')
  async likeComment(
    @Body('comment_uuid') comment_uuid: string,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    return await this.commentService.addLikeComment(comment_uuid, uuid);
  }

  @Delete('unlike')
  async unlikeComment(
    @Body('comment_uuid') comment_uuid: string,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    return await this.commentService.removeLikeComment(comment_uuid, uuid);
  }

  @Delete('delete-comment')
  async deleteComment(
    @Body('comment_uuid') comment_uuid: string,
    @Req() req: Request
  ) {
    const { uuid } = req['user'];
    return await this.commentService.deleteComment(comment_uuid, uuid);
  }
}
