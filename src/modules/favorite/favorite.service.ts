import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { Comic } from 'src/entities';
import { getRandomItemInObject } from 'src/utils';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>
  ) {}

  async checkFavorite(user_uuid: string, comic_uuid: string): Promise<Http> {
    try {
      const status = await this.comicRepository.query(`
    SELECT EXISTS (
        SELECT 1
        FROM favorite
        WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}'
    )`);

      //   if (!status[0]?.exists)
      //     return createBadRequset('comic_uuid is not exist');

      return createSuccessResponse(status[0]?.exists, 'check favorite success');
    } catch (error) {
      return createBadRequsetNoMess(error);
    }
  }

  async getAllComicUserWasFavorite(
    user_uuid: string,
    page: number
  ): Promise<Http> {
    try {
      const total = await this.comicRepository.query(`
      SELECT COUNT(favorite.comic_uuid) AS total_records
      FROM favorite
      WHERE favorite.user_uuid = '${user_uuid}'
      `);
      console.log(total[0].total_records);

      const comics = await this.comicRepository.query(`
      SELECT
      c.*,
      ARRAY_AGG(t.name) AS topics,
      CAST((
          SELECT COALESCE(SUM(chapter.views), 0)
          FROM chapter
          WHERE chapter.comic_uuid = c.uuid
      ) AS INT) AS views,
      CAST((
        SELECT COALESCE(AVG(rating.rating), 0)
        FROM rating
        WHERE rating.comic_uuid = c.uuid
    ) AS FLOAT) AS rating,
      CAST((
          SELECT COUNT(favorite.comic_uuid)
          FROM favorite
          WHERE favorite.comic_uuid = c.uuid
      ) AS INT) AS favorite,
      CAST((
        SELECT COUNT(chapter.comic_uuid)
        FROM chapter
        WHERE chapter.comic_uuid = c.uuid
    ) AS INT) AS page
  FROM
      comic c
  LEFT JOIN
      comic_topic ct ON c.uuid = ct.comic_uuid
  LEFT JOIN
      topic t ON ct.topic_uuid = t.uuid
    LEFT JOIN
        favorite f ON c.uuid = f.comic_uuid
        WHERE f.user_uuid = '${user_uuid}'
  GROUP BY c.uuid
  ORDER BY c.created_at DESC
  LIMIT 21 OFFSET ((${page} - 1) * 21)
      `);
      const panigation = panigationData(page, comics, total[0].total_records);

      return createSuccessResponse(panigation, 'get all favorite success');
    } catch (error) {
      return createBadRequsetNoMess(error);
    }
  }

  async addFavorite(user_uuid: string, comic_uuid: string): Promise<Http> {
    try {
      const isExist = await this.comicRepository.query(`
        SELECT EXISTS (
          SELECT 1
          FROM favorite
          WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}'
        )`);
      if (isExist[0]?.exists) {
        const delteFavorite = await this.comicRepository.query(`
        DELETE FROM favorite
        WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}'
        `);
        console.log();
        if (delteFavorite[1] === 0)
          return createBadRequset('delete favorite fail');
        return createSuccessResponse(false, 'delete favorite success');
      }
      const addFavorite = await this.comicRepository.query(`
      INSERT INTO favorite (user_uuid, comic_uuid)
      VALUES ('${user_uuid}', '${comic_uuid}')
      `);

      if (addFavorite[1] === 0) return createBadRequset('add favorite fail');
      return createSuccessResponse(true, 'add favorite success');
    } catch (error) {
      return createBadRequsetNoMess(error);
    }
  }

  async removeFavorite(user_uuid: string, comic_uuid: string): Promise<Http> {
    try {
      const status = await this.comicRepository.query(`
      DELETE FROM favorite
      WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}'
      `);

      if (!status?.rowCount) return createBadRequset('remove favorite fail');
      return createSuccessResponse(true, 'remove favorite success');
    } catch (error) {
      return createBadRequsetNoMess(error);
    }
  }

  async createDummyFavorite() {
    const getAllUser = await this.comicRepository.query(`
    SELECT uuid FROM "user"
    `);
    const getAllComic = await this.comicRepository.query(`
    SELECT uuid FROM comic
    `);

    for (const user of getAllUser) {
      const randomComic: Comic[] = await getRandomItemInObject(getAllComic, 10);
      for (const comic of randomComic) {
        const isExist = await this.comicRepository.query(`
        SELECT EXISTS (
          SELECT 1
          FROM favorite
          WHERE user_uuid = '${user.uuid}' AND comic_uuid = '${comic.uuid}'
        )`);

        if (!isExist[0]?.exists) {
          await this.comicRepository.query(`
            INSERT INTO favorite (user_uuid, comic_uuid)
            VALUES ('${user.uuid}', '${comic.uuid}')
            `);
        }
      }
    }
    return createSuccessResponse(
      'Create dummy favorite',
      'Create dummy favorite'
    );
  }
}
