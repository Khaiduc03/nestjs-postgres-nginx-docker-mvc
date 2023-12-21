import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  Http,
  createBadRequset,
  createSuccessResponse,
  throwDataError,
} from 'src/common';
import { AuthGuard } from 'src/core';
import { CreateTopicDTO, DeleteTopicDTO, UpdateTopicDTO } from './dto';
import { TopicService } from './topic.service';
import { API_URL } from 'src/environments';
import { toArray } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Topic } from 'src/entities';
import { IPanigationResponse } from '../type';

@Controller(`${API_URL}/topic`)
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class TopicController {
  constructor(private topicService: TopicService) {}

  //get all topic
  @Get()
  async getAllTopic(): Promise<Http> {
    const topics = await this.topicService.getAllTopic();
    if (!topics) return createBadRequset('Get all topic');
    return createSuccessResponse(topics, 'Get all topic');
  }

  @Get('v1')
  async getAllTopicv1(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<any> {
    const response = await this.topicService.getAllTopicV1(page);
    return createSuccessResponse(response, 'Get all topic');
  }

  @Get('dummy-topic')
  async getDummyTopic(): Promise<Http> {
    return await this.topicService.createDummyTopic();
  }

  //get topic by id
  @Get('uuid')
  async getTopicById(@Param('uuid') uuid: string): Promise<Http> {
    const response = await this.topicService.getTopicById(uuid);
    if (!response) return createBadRequset('Get topic by uuid');
    return createSuccessResponse(response, 'Get topic by uuid');
  }

  //create topic
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateTopicDTO,
  })
  async createTopic(
    @UploadedFile() image: Express.Multer.File,
    @Body() createTopicDTO: CreateTopicDTO
  ): Promise<Http> {
    return await this.topicService.createTopic(createTopicDTO, image);
  }

  //update topic by id
  @Put('update')
  @ApiBody({
    type: UpdateTopicDTO,
  })
  async updateTopicById(@Body() UpdateTopicDTO: UpdateTopicDTO): Promise<Http> {
    return this.topicService.updateTopicById(UpdateTopicDTO);
  }

  //delet topic by id
  @Delete('delete')
  @ApiBody({
    type: DeleteTopicDTO,
  })
  async deleteTopicById(
    @Body()
    deleteTopicDTO: DeleteTopicDTO
  ): Promise<Http> {
    const { uuids, option } = deleteTopicDTO;
    const response = await this.topicService.deleteTopicById(uuids, option);
    return response;
  }

  // delete topic by id v2
  @Delete('delete/v2')
  async deleteTopicByIdV1(@Param('uuid') uuid: string): Promise<Http> {
    const response = await this.topicService.deleteTopicByIdV1(uuid);
    return response;
  }
}
