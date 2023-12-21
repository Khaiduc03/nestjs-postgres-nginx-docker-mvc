import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import {
  Http,
  createBadRequsetNoMess,
  createSuccessResponse,
  createSuccessResponseNoContent,
  throwDataError,
} from 'src/common';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { ComicService } from './comic.service';
import {
  CreateComicDTO,
  DeleteComicDTO,
  GetComicByTopicDTO,
  GetComicsByNameDTO,
  UpdateAvatarComicDTO,
  UpdateComicDTO,
  UuidComicDTO,
} from './dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiSecurity,
} from '@nestjs/swagger';
import { IPanigationResponse } from '../type';
import { Comic } from 'src/entities';
@ApiBearerAuth()
@Controller(`${API_URL}/comic`)
@UseGuards(AuthGuard)
export class ComicController {
  constructor(private comicService: ComicService) {}

  //create comic
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateComicDTO,
  })
  async createComic(
    @Body() createComicDTO: CreateComicDTO,
    @UploadedFile() image: Express.Multer.File
  ): Promise<Http> {
    console.log('image' + image);
    console.log(createComicDTO);
    return this.comicService.createComic(createComicDTO, image);
  }

  //get detail comic by uuid
  @Get('uuid/:uuid')
  async getDetailComicByUuid(
    @Param('uuid') uuid: string,
    @Req() req: Request
  ): Promise<Http> {
    console.log(uuid);
    const user = req['user'];
    const response = await this.comicService.getDetailComicByUuid(
      user.uuid,
      uuid
    );
    return response;
  }

  //get all comic
  @Get()
  async getAllComic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
    // @Query('page') page: any
  ): Promise<any> {
    const response = await this.comicService.getAllComic(page);

    return response;
  }

  @Get('v2')
  async getAllComicV2(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<any> {
    const response = await this.comicService.getAllComicV2(page);
    // throwDataError<IPanigationResponse<Comic>>(
    //   response,
    //   'Get all comic failed'
    // );

    return createSuccessResponse(response, 'Get all comic');
  }

  //create dummy comic
  @Get('dummy-comic')
  async createDummyComic(): Promise<Http> {
    return this.comicService.createDummyComic();
  }

  //update comic by id
  @Put('update')
  @ApiBody({
    type: UpdateComicDTO,
  })
  async updateComicById(@Body() updateComicDTO: UpdateComicDTO): Promise<any> {
    console.log(updateComicDTO);
    return this.comicService.updateComicByUuId(updateComicDTO);
  }

  //update comic image
  @Put('update-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateComicDTO,
  })
  async updateComicImage(
    @Body() updateAvatarComicDTO: UpdateAvatarComicDTO,
    @UploadedFile() image: Express.Multer.File
  ): Promise<Http> {
    return this.comicService.updateAvatartComic(
      updateAvatarComicDTO.uuid,
      image
    );
  }

  //get all comic by topic
  @Get('by-topic')
  async getAllComicByTopic(
    @Query() GetComicByTopicDTO: GetComicByTopicDTO
  ): Promise<any> {
    const { topic_name, page } = GetComicByTopicDTO;
    return await this.comicService.getAllComicByTopicName(
      topic_name,
      Number(page)
    );
  }

  //get all comic by name
  @Get('by-name')
  async getAllComicByName(
    @Query() getComicsByNameDTO: GetComicsByNameDTO
  ): Promise<Http> {
    const { comic_name, page } = getComicsByNameDTO;
    if (comic_name == 'drop' || comic_name === 'SELECT')
      return createBadRequsetNoMess('Invalid comic name');

    return await this.comicService.getAllComicByName(comic_name, Number(page));
  }

  //delete comic by id
  @Delete('delete')
  @ApiBody({
    type: DeleteComicDTO,
  })
  async deleteComicById(@Body() deleteComicDTO: DeleteComicDTO): Promise<Http> {
    return this.comicService.deleteComicById(deleteComicDTO);
  }

  @Get('update-topic')
  async updateTopic(): Promise<Http> {
    return await this.comicService.updateAllComicTopic();
  }

  @Get('top-views')
  async getTopViews(): Promise<Http> {
    return await this.comicService.getTopViewComic();
  }

  @Get('top-rating')
  async getTopRating(): Promise<Http> {
    return await this.comicService.getTopRatingComic();
  }

  @Get('top-favorite')
  async getTopFavorite(): Promise<Http> {
    return await this.comicService.getTopFavoriteComic();
  }
}
