import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ImageService } from './image.service';

import { Http, createSuccessResponse } from 'src/common';
import { AuthGuard } from 'src/core';
import { CreateImageDTO, getImagesDTO } from './dto';
import { API_URL } from 'src/environments';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller(`${API_URL}/image`)
@UseGuards(AuthGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async getImages(): Promise<Http> {
    return await this.imageService.getImages();
  }

  @Get('uuid/:uuid')
  async getImage(@Param('uuid') uuid: string): Promise<Http> {
    return await this.imageService.getImage(uuid);
  }

  @Post()
  //@Roles(UserRole.Admin)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateImageDTO,
  })
  async createImage(
    @UploadedFile() images: Express.Multer.File
  ): Promise<Http> {
    const response = await this.imageService.uploadImage(images, 'test');
    return createSuccessResponse(response, 'Create image');
  }

  @Post('multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image1', maxCount: 2 },
      { name: 'image2', maxCount: 1 },
    ])
  )
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<any> {
    const response = await this.imageService.uploadMultipleImages(
      files,
      'test12345'
    );
    return createSuccessResponse(response, 'Create image');
  }

  // @Get('dummy-image')
  // async craeteDummyImage(): Promise<Http> {
  //   const response = await this.imageService.createDummyImagesChapter();
  //   return createSuccessResponse(response, 'Create dummy image')
  // }

  // @Get('test123')
  // async getAllImageOnFolder(@Body() tag: getImagesDTO) {
  //   return await this.imageService.getAllImageOnFolder(tag);
  // }

  // @Delete()
  // async deleteImage(@Body() uuid: uuidImage): Promise<Http> {
  //     return await this.imageService.deleteImage(uuid.uuid);
  // }
}
