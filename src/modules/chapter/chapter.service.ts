import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
} from 'src/common';
import { Chapter, Image, User } from 'src/entities';

import { RedisManagerService } from 'src/core';
import { Repository, UpdateResult } from 'typeorm';
import { ComicService } from '../comic';
import { ImageService } from '../image';
import { CreateChapterDTO, UpdateChapterDTO } from './dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    private readonly imageService: ImageService,
    private readonly commicService: ComicService,
    @InjectRedis() private readonly redis: Redis,
    private readonly redisManagerService: RedisManagerService,
    private readonly historyService: HistoryService
  ) {}

  ////////////////////////////////////////////////////////////CREATE///////////////////////////////////////////////////////
  async createChapter(createChapterDTO: CreateChapterDTO): Promise<Http> {
    const comic = await this.chapterRepository.query(`
    SELECT * FROM comic WHERE uuid = '${createChapterDTO.comic_uuid}'
    `);
    if (!comic) return createBadRequsetNoMess('Comic is not exits!!');
    const { tag } = createChapterDTO;

    const chapter = new Chapter({
      ...createChapterDTO,
      chapter_number: Number(createChapterDTO.chapter_number),
      comic: comic.uuid,
    });

    if (!chapter) return createBadRequsetNoMess('Create chapter is fail!!');
    const response = await this.chapterRepository.save(chapter);
    await this.imageService.getAllImageOnFolder(tag, response.uuid);
    if (!response) return createBadRequsetNoMess('Create chapter is fail!!');
    return createSuccessResponse(response, 'Create chapter');
  }

  // get all chapter by comic id
  async getAllChapterByComicUuId(comic_uuid: string): Promise<any> {
    try {
      const query = await this.chapterRepository.query(`
        SELECT * FROM chapter WHERE comic_uuid = '${comic_uuid}' ORDER BY chapter_number ASC
        
        `);
      return query;
    } catch (error) {
      return null;
    }
  }

  async createDummyChapter(): Promise<any> {
    try {
      await this.redisManagerService.refreshCacheComics();
      await this.redisManagerService.refreshCacheChapter();

      const response = await this.commicService.getAllComicforDev();

      for (const comic of response) {
        for (let i = 0; i < 50; i++) {
          const random: number = Math.floor(Math.random() * 1000);
          const chapter = new Chapter({
            chapter_name: `Episode ${i + 1}`,
            chapter_number: i + 1,
            comic: comic.uuid,
            views: random,
          });

          await this.chapterRepository.save(chapter);
          await this.imageService.createDummyImagesChapter(chapter.uuid);
          // chapters.push(chapter);
        }
      }

      // const chaptersResponse = await this.chapterRepository.save(chapters);
      // if (!chaptersResponse)
      //   return createBadRequsetNoMess('Create chapter is fail!!');
      return createSuccessResponse(`chapter  was created`, 'Create chapter');
    } catch (error) {
      console.log(error);
      return createBadRequsetNoMess('Create chapter is fail!!');
    }
  }

  async getDetailChapter(comic_uuid: string, chapter_number: number) {
    try {
      const image = await this.chapterRepository.query(`
      SELECT i.*, c.chapter_name, cm.comic_name, cm.uuid as comic_uuid
       FROM image i
      LEFT JOIN chapter c ON i.chapter_uuid = c.uuid
      LEFT JOIN comic cm ON c.comic_uuid = cm.uuid
      WHERE c.comic_uuid = '${comic_uuid}' AND c.chapter_number = ${chapter_number}
      ORDER BY page ASC
      `);
      return image;
    } catch (error) {
      return error;
    }
  }

  //get chapter by uuid v2
  async getDataChapterV2(
    comic_uuid: string,
    user_uuid: string,
    chapter_number: number = 0
  ) {
    try {
      // console.log('hihi');
      // const user_uuid = user.uuid;
      if (chapter_number === 0) {
        const chapters = await this.chapterRepository.query(
          `SELECT * FROM chapter where comic_uuid = '${comic_uuid}' ORDER BY chapter_number ASC`
        );
        return createSuccessResponse(chapters, 'Get all chapter of comic');
      } else {
        const totalChapter = await this.chapterRepository.query(`
        SELECT COUNT(*) FROM chapter WHERE comic_uuid = '${comic_uuid}'
        `);
        if (totalChapter[0].count < chapter_number || chapter_number < 0)
          return createBadRequsetNoMess(
            `Chapter ${chapter_number} is not exits!!`
          );
        const currentChapter = await this.chapterRepository.query(`
            SELECT * FROM chapter WHERE comic_uuid = '${comic_uuid}'
            AND chapter_number = ${chapter_number}
        `);
        const nextChapter = await this.chapterRepository.query(`
        SELECT * FROM chapter WHERE comic_uuid = '${comic_uuid}'
        AND chapter_number = ${chapter_number + 1}
        `);
        const previousChapter = await this.chapterRepository.query(`
        SELECT * FROM chapter WHERE comic_uuid = '${comic_uuid}'
        AND chapter_number = ${chapter_number - 1}
        `);
        if (currentChapter[0]) {
          this.updateViewChapter(currentChapter[0].uuid, user_uuid);
          this.historyService.createHistory(
            currentChapter[0].chapter_number,
            comic_uuid,
            user_uuid
          );
        }
        const totalComment = await this.chapterRepository.query(`
        SELECT COUNT(*) FROM comment WHERE chapter_uuid = '${currentChapter[0].uuid}'
        `);

        const dataChapter: Image[] = await this.chapterRepository.query(
          `SELECT i.*
          FROM image i
          WHERE chapter_uuid = '${currentChapter[0].uuid}'
           ORDER BY page ASC`
        );

        const response = {
          next_chapter: nextChapter[0]
            ? `chapter/${comic_uuid}?chapter_number=${nextChapter[0].chapter_number}`
            : null,
          previous_chapter: previousChapter[0]
            ? `chapter/${comic_uuid}?chapter_number=${previousChapter[0].chapter_number}`
            : null,
          totalComment: Number(totalComment[0]['count']),
          data_chapter: dataChapter,
        };

        return createSuccessResponse(response, 'Get all data of chapter');
      }
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all data of chapter');
    }
  }

  // get chapter by uuid
  // async getDataChapter(
  //   comic_uuid: string,
  //   user: User,
  //   chapter_number = 0
  // ): Promise<Http> {
  //   try {
  //     const user_uuid = user.uuid;
  //     let response: any;
  //     let previousChapter: string;
  //     let primaryChapter: Chapter;
  //     let nextChapter: string;

  //     if (chapter_number === 0) {
  //       const getCache = await this.redis.get(`chapter:${comic_uuid}:all`);
  //       if (getCache)
  //         return createSuccessResponse(
  //           JSON.parse(getCache),
  //           'Get all chapter of comic'
  //         );
  //     } else {
  //       const getCache = await this.redis.get(
  //         `chapter:${comic_uuid}:${chapter_number}`
  //       );
  //       if (getCache) {
  //         await this.historyService.createHistory(
  //           chapter_number,
  //           comic_uuid,
  //           user
  //         );
  //         const data = JSON.parse(getCache);
  //         const checkView = await this.redis.get(
  //           `chapter:${comic_uuid}:${chapter_number}:${user_uuid}`
  //         );
  //         if (checkView === null) {
  //           // const check = await this.updateViewFunction(
  //           //   data.data_chapter[0]['chapter_uuid']
  //           // );
  //           // await this.redis.set(
  //           //   `chapter:${comic_uuid}:${chapter_number}:${user_uuid}`,
  //           //   JSON.stringify({
  //           //     updateView: check,
  //           //   }),
  //           //   'EX',
  //           //   100
  //           // );
  //         }

  //         return createSuccessResponse(data, 'Get all data of chapter');
  //       }
  //     }

  //     const chapters = await this.chapterRepository.query(
  //       `SELECT * FROM chapter where comic_uuid = '${comic_uuid}' ORDER BY chapter_number ASC`
  //     );

  //     //main logic
  //     if (chapter_number === 0) {
  //       await this.redis.set(
  //         `chapter:${comic_uuid}:all`,
  //         JSON.stringify(chapters),
  //         'EX',
  //         10
  //       );
  //       return createSuccessResponse(chapters, 'Get all chapter of comic');
  //     } else {
  //       await this.historyService.createHistory(
  //         chapter_number,
  //         comic_uuid,
  //         user
  //       );

  //       if (chapters.length + 1 < chapter_number)
  //         return createBadRequsetNoMess('Chapter is not exits!!');

  //       const chapterIndex = chapters.findIndex(
  //         (chapter) => chapter.chapter_number === chapter_number
  //       );

  //       if (chapterIndex !== -1) {
  //         primaryChapter = chapters[chapterIndex];
  //         if (chapterIndex + 1 === chapters.length) {
  //           nextChapter === null;
  //         } else {
  //           nextChapter = `chapter/${
  //             chapters[chapterIndex + 1].comic_uuid
  //           }\?chapter_number=${chapters[chapterIndex + 1].chapter_number}`;
  //         }
  //         if (chapterIndex == 0) {
  //           previousChapter === null;
  //         } else {
  //           previousChapter = `chapter/${
  //             chapters[chapterIndex - 1]?.comic_uuid
  //           }\?chapter_number=${chapters[chapterIndex - 1]?.chapter_number}`;
  //         }

  //         const totalComment = await this.chapterRepository.query(`
  //         SELECT COUNT(*) FROM comment WHERE chapter_uuid = '${primaryChapter.uuid}'
  //         `);
  //         console.log(totalComment);

  //         const dataChapter: Image[] = await this.chapterRepository.query(
  //           `SELECT i.*
  //           FROM image i
  //           WHERE chapter_uuid = '${primaryChapter.uuid}'
  //            ORDER BY page ASC`
  //         );
  //         if (!dataChapter) return createBadRequset('Get data chapter');
  //         // const updateView = await this.updateViewFunction(
  //         //   dataChapter[0]['chapter_uuid']
  //         // );
  //         // if (updateView) {
  //         //   await this.redis.set(
  //         //     `chapter:${comic_uuid}:${chapter_number}:${user_uuid}`,
  //         //     JSON.stringify({
  //         //       updateView,
  //         //     }),
  //         //     'EX',
  //         //     40
  //         //   );
  //         // }
  //         response = {
  //           next_chapter: nextChapter || null,
  //           previous_chapter: previousChapter || null,
  //           totalComment: Number(totalComment[0]['count']),
  //           data_chapter: dataChapter,
  //         };
  //         await this.redis.set(
  //           `chapter:${comic_uuid}:${chapter_number}`,
  //           JSON.stringify(response),
  //           'EX',
  //           10
  //         );
  //       } else {
  //         return createBadRequsetNoMess('Chapter is not exits!!');
  //       }
  //     }

  //     return createSuccessResponse(response, 'Get all data of chapter');
  //   } catch (error) {
  //     console.log(error);
  //     return createBadRequset('Get all data of chapter');
  //   }
  // }

  //update chapter by uuid
  async updateChapterByUuid(
    updateChapterDTO: Partial<UpdateChapterDTO>
  ): Promise<Http> {
    const { chapter_name, chapter_number, uuid } = updateChapterDTO;
    const chapter = await this.chapterRepository.findOne({
      where: { uuid: uuid },
      relations: ['images'],
    });
    if (!chapter) return createBadRequsetNoMess('Chapter is not exits!!');

    Object.assign(chapter, {
      chapter_name: chapter_name,
      chapter_number: chapter_number,
    });
    const response = await this.chapterRepository.save(chapter);
    if (!response) return createBadRequsetNoMess('Update chapter is fail!!');
    return createSuccessResponse(response, 'Update chapter');
  }

  async deleteChapterByUuid(uuid: string): Promise<Http> {
    const chapter = await this.chapterRepository.findOne({
      where: { uuid: uuid },
      relations: ['images'],
    });
    if (!chapter) return createBadRequsetNoMess('Chapter is not exits!!');
    const response = await this.chapterRepository.remove(chapter);
    if (!response) return createBadRequsetNoMess('Delete chapter is fail!!');
    return createSuccessResponse(response, 'Delete chapter');
  }

  async updateViewChapter(chapter_uuid: string, user_uuid: string) {
    const cache = await this.redis.get(`chapter:${chapter_uuid}:${user_uuid}`);
    if (cache) {
      console.log('was increase view');
      return;
    }
    const updateview: UpdateResult = await this.chapterRepository.update(
      { uuid: chapter_uuid },
      { views: () => 'views + 1' }
    );
    if (updateview.affected === 0) console.log('update view chapter is fail!!');

    await this.redis.set(
      `chapter:${chapter_uuid}:${user_uuid}`,
      JSON.stringify({
        updateView: true,
      }),
      'EX',
      40
    );
  }

  // async updateViewFunction(chapter_uuid: string) {
  //   //console.log(chapter_uuid);
  //   const response = await this.chapterRepository.query(
  //     `SELECT increase_chapter_views('${chapter_uuid}');
  //     `
  //   );
  //   return response[0]['increase_chapter_views'];
  // }
}
