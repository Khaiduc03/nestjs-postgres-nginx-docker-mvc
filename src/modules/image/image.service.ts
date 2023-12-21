import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
} from 'src/common';

import { faker } from '@faker-js/faker';
import { Image } from 'src/entities';
import { Repository } from 'typeorm';
import { CloudService } from '../cloud';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloud: CloudService
  ) {}
  /////////////////////////////// cloudinary ///////////////////////////////
  async uploadImageToCloud(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const response = await this.cloud.uploadFileImage(file, folder);
    return response;
  }

  async deleteImageFromCloud(
    publicId: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const response = await this.cloud.deleteFileImage(publicId);
    return response;
  }

  async uploadAvatarToCloud(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const response = await this.cloud.uploadFileAvatar(file, folder);
    return response;
  }

  //////////////////////////// image ////////////////////////////
  async uploadImage(
    file: Express.Multer.File,
    folder: string
  ): Promise<Image | undefined> {
    const uploaded = await this.uploadImageToCloud(file, folder);
    if (!uploaded) return undefined;
    const image = new Image({
      public_id: uploaded.public_id,
      url: uploaded.url,
      secure_url: uploaded.secure_url,
    });

    const response = await this.imageRepository.save(image);
    if (!response) return undefined;
    return response;
  }

  async uploadAvatarToCloud1(
    file: Express.Multer.File,
    folder: string
  ): Promise<Image> {
    const uploaded = await this.cloud.uploadFileAvatar(file, folder);
    if (!uploaded) return undefined;
    const image = new Image({
      public_id: uploaded.public_id,
      url: uploaded.url,
      secure_url: uploaded.secure_url,
    });

    const response = await this.imageRepository.save(image);
    if (!response) return undefined;

    return response;
  }

  async uploadMutipleImageToCloud(
    files: Express.Multer.File[],
    folder: string
  ): Promise<UploadApiErrorResponse | UploadApiResponse[]> {
    const filesArray = Object.values(files).flat();
    const uploaded = await this.cloud.uploadMultipleFiles(filesArray, folder);
    return uploaded;
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string
  ): Promise<Image[]> {
    const uploadedImages: Image[] = [];
    const uploadedResults = await this.uploadMutipleImageToCloud(files, folder);
    for (let i = 0; i < uploadedResults.length; i++) {
      const uploadedResult = uploadedResults[i];
      const image = new Image({
        public_id: uploadedResult.public_id,
        url: uploadedResult.url,
        secure_url: uploadedResult.secure_url,
      });
      uploadedImages.push(image);
    }
    await this.imageRepository.save(uploadedImages);

    return uploadedImages;
  }

  async getImages(): Promise<Http> {
    const response = await this.imageRepository.find();
    return createSuccessResponse(response, 'Get images');
  }

  async getImage(uuid: string): Promise<Http> {
    const image = await this.imageRepository.findOneByOrFail({
      uuid: uuid,
    });
    if (!image) return createBadRequset('get image');

    return createSuccessResponse(image, 'Get images');
  }

  async createImage(url?: string): Promise<Image> {
    const image = new Image({
      public_id: url,
      url: url,
      secure_url: url,
    });
    const response = await this.imageRepository.save(image);
    return response;
  }

  async createDummyImage(
    width = 250,
    height = 342
  ): Promise<Image | undefined> {
    const uri = faker.image.url({
      height: width,
      width: height,
    });
    const image = new Image({
      public_id: uri,
      url: uri,
      secure_url: uri,
    });
    return await this.imageRepository.save(image);
  }

  async updateImageUrl(
    public_id: string,
    file: Express.Multer.File,
    folder: string
  ): Promise<{
    image_url: string;
    public_id: string;
  }> {
    try {
      if (public_id.length > 0) {
        await this.deleteImageFromCloud(public_id);
      }

      const uploaded = await this.uploadAvatarToCloud(file, folder);
      if (!uploaded) return null;

      return {
        image_url: uploaded.url,
        public_id: uploaded.public_id,
      };
    } catch (error) {
      console.log('Something went wrong: Service: updateImageUrl' + error);
      throw error;
    }
  }

  // delete image
  async deleteAvatar(avatar: Partial<Image>): Promise<Image> {
    const image = await this.imageRepository.findOne({
      where: { uuid: avatar.uuid },
    });
    if (!image) return null;
    if (image.public_id === null) return null;
    await this.deleteImageFromCloud(image.public_id).catch((error) => {
      return createBadRequsetNoMess(error);
    });
    const reponse = await this.imageRepository.save({
      ...image,
      public_id: null,
      url: null,
      secure_url: null,
    });
    return reponse;
  }

  async getAllImageOnFolder(
    tag: string,
    chapter_uuid: string
  ): Promise<Image[]> {
    try {
      const response = await this.cloud.getAllImageOnFolder(tag);
      const images = [];
      response.forEach(async (image) => {
        const newImage = new Image({
          public_id: image.public_id,
          url: image.url,
          secure_url: image.secure_url,
          page: image.public_id.split('/').pop()!.split('_')[0],
          chapter: chapter_uuid,
        });

        if (!newImage)
          return createBadRequsetNoMess(
            'Something went wrong when get url from cloudinary'
          );
        images.push(newImage);
      });
      const chapterImages: Image[] = await this.imageRepository.save(images);

      return chapterImages;
    } catch (error) {
      console.log('Something went wrong: Service: getAllImageOnFolder' + error);
      throw error;
    }
  }

  async getImageOfChapter(chapter_uuid: string): Promise<any> {
    try {
      const response = await this.imageRepository
        .createQueryBuilder('image')
        .leftJoinAndSelect('image.chapter', 'chapter')
        .where('chapter.uuid = :uuid', { uuid: chapter_uuid })
        .orderBy('image.page', 'ASC')
        .getMany();

      if (!response)
        return createBadRequsetNoMess('Get image of chapter is fail😡');
      return response;
    } catch (error) {
      throw new Error('Have error at getImageOfChapter metho');
    }
  }

  async createDummyImagesChapter(chapter_uuid: string): Promise<Image[]> {
    try {
      const images = [];

      for (let i = 0; i <= 50; i++) {
        const url = faker.image.url({ height: 1000, width: 700 });
        const image = new Image({
          url: url,
          public_id: url,
          secure_url: url,
          page: i,
          chapter: chapter_uuid,
        });
        images.push(image);
      }
      const response = await this.imageRepository.save(images);
      if (!response) return null;
      return response;
    } catch (error) {}
  }
}
