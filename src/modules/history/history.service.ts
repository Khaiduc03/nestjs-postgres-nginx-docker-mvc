import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequset,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { Favorite, History, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>
  ) {}

  //get all history of user
  async getAllHistory(user_uuid: string, page: number = 1): Promise<any> {
    const response = await this.historyRepository.query(`
      SELECT c.*,
             h.*,
             ARRAY_AGG(t.name) AS topics,
             CAST((
              SELECT COALESCE(SUM(chapter.views), 0)
              FROM chapter
              WHERE chapter.comic_uuid = c.uuid
          ) AS INT) AS views
      FROM history h
      LEFT JOIN comic c ON h.comic_uuid = c.uuid
      LEFT JOIN comic_topic ct ON c.uuid = ct.comic_uuid
      LEFT JOIN topic t ON ct.topic_uuid = t.uuid
      WHERE h.user_uuid = '${user_uuid}'
      GROUP BY h.uuid, c.uuid
      LIMIT 21 OFFSET ((${page} - 1) * 21);
    `);
    if (!response) return createBadRequset('Get all history');

    const total = await this.historyRepository.query(`
    SELECT COUNT(*) AS count
        FROM history
        WHERE user_uuid = '${user_uuid}';`);

    const data = panigationData(page, response, Number(total[0]['count']));
    return createSuccessResponse(data, 'Get all history');
  }

  //create
  async createHistory(
    last_chapter_number: number,
    comic_uuid: string,
    user_uuid: string
  ) {
    try {
      const checkHistory = await this.historyRepository.query(`
          SELECT * FROM history WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}';
          `);
      if (checkHistory.length > 0) {
        await this.historyRepository.query(`
              UPDATE history SET last_chapter_number = ${last_chapter_number} WHERE user_uuid = '${user_uuid}' AND comic_uuid = '${comic_uuid}';
              `);
      } else {
        const newHistory = this.historyRepository.create({
          last_chapter_number,
          comic_uuid,
          user_uuid,
        });
        if (!newHistory) return;
        await this.historyRepository.save(newHistory);
      }
    } catch (error) {
      console.log(error);
    }
  }
  //check is exits
}
