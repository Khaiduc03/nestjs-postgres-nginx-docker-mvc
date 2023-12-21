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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Http } from 'src/common';
import { AuthGuard } from 'src/core';
import { API_URL } from 'src/environments';
import { ChapterService } from './chapter.service';
import { CreateChapterDTO, UuidChapterDTO, UuidComicDTO } from './dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller({ path: `${API_URL}/chapter` })
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  //create chapter
  @Post()
  @ApiBody({
    type: CreateChapterDTO,
  })
  async createChapter(
    @Body() createChapterDTO: CreateChapterDTO
  ): Promise<Http> {
    return await this.chapterService.createChapter(createChapterDTO);
  }

  //get all chapter
  // @Get('')
  // async getAllChapterByComicUuid(
  //   @Query('comic_uuid') comic_uuid: string
  // ): Promise<any> {
  //   console.log(comic_uuid);
  //   return await this.chapterService.getAllChapterByComicUuId(comic_uuid);
  // }

  //Create dummy chapter
  @Get('dummy-chapter')
  async createDummyChapter(): Promise<any> {
    const response = await this.chapterService.createDummyChapter();
    return response;
  }

  //get by id chapter
  @Get(':comic_uuid')
  async getChapterByUuid(
    @Param() comic_uuid: UuidComicDTO,
    @Query('chapter_number', new DefaultValuePipe(0), ParseIntPipe)
    chapter_number: number = 0,
    @Req() req: Request
  ): Promise<any> {
    try {
      console.log(comic_uuid.comic_uuid);
      const { uuid } = req['user'];
      console.log(chapter_number);
      if (Number(chapter_number) < 0) {
        chapter_number = 0;
      }

      return await this.chapterService.getDataChapterV2(
        comic_uuid.comic_uuid,
        uuid,
        Number(chapter_number)
      );
    } catch (error) {
      console.log('Something went wrong at get chapter by uuid: ' + error);
      throw error;
    }
  }

  //update chapter
  @Put()
  @ApiBody({
    type: CreateChapterDTO,
  })
  async updateChapter(
    @Body() updateChapterDTO: CreateChapterDTO
  ): Promise<Http> {
    try {
      const response = await this.chapterService.updateChapterByUuid(
        updateChapterDTO
      );

      return response;
    } catch (error) {
      console.log('Something went wrong at update chapter: ' + error);
      throw error;
    }
  }

  // delete chapter by id
  @Delete('delete')
  @ApiBody({
    type: UuidChapterDTO,
  })
  async deleteChapterByUuid(
    @Body() uuidChapterDTO: UuidChapterDTO
  ): Promise<Http> {
    try {
      const response = await this.chapterService.deleteChapterByUuid(
        uuidChapterDTO.uuid
      );
      return response;
    } catch (error) {
      console.log('Something went wrong at delete chapter: ' + error);
      throw error;
    }
  }

  // @Get('test/:uuid')
  // async testFunction(@Param() uuid: string) {
  //   return await this.chapterService.updateViewFunction(uuid['uuid']);
  // }
}
