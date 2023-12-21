import { faker, fakerEN_US, fakerVI } from '@faker-js/faker';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { Comic, Topic } from 'src/entities';
import { getRandomItemInObject } from 'src/utils';
import { In, Repository } from 'typeorm';
import { CloudService } from '../cloud';
import { ImageService } from '../image';
import { IPanigationResponse } from '../type';
import { TopicService } from './../topic/topic.service';
import { CreateComicDTO, DeleteComicDTO, UpdateComicDTO } from './dto';
import { isString } from 'class-validator';
import { toArray } from 'rxjs';

@Injectable()
export class ComicService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    private readonly TopicService: TopicService,
    private readonly cloud: CloudService,
    private readonly imageService: ImageService,

    @InjectRedis() private readonly redis: Redis
  ) {}
  //create comic
  async createComic(
    createComicDTO: CreateComicDTO,
    image: Express.Multer.File
  ): Promise<Http> {
    try {
      let arrTopics = [];
      await this.refreshCache();
      if (!image) return createBadRequsetNoMess('Image is not exits!!');
      const { topics, author, comic_name, description } = createComicDTO;
      console.log(topics);
      if (isString(topics)) {
        arrTopics.push(topics);
      }
      if (Array.isArray(topics)) {
        arrTopics = topics;
      }
      const topic = await this.TopicService.getAllTopicsByName(arrTopics);
      const imageOfComic = await this.cloud.uploadFileAvatar(
        image,
        `comic/${comic_name}`
      );
      if (!imageOfComic || imageOfComic === undefined)
        return createBadRequset('Upload image is fail!!');
      if (!topic) return createBadRequset('Topic is not exits!!');
      const comic = new Comic({
        ...createComicDTO,
        topics: topic,
        author: author,
        description: description,
        image_url: imageOfComic.url,
        public_id: imageOfComic.public_id,
      });
      console.log(comic);
      const response = await this.comicRepository.save(comic);
      console.log(response);
      if (!response) return createBadRequset('Create comic is fail!!');
      return createSuccessResponse(response, 'Create comic');
    } catch (error) {
      console.log('Something went wrong at create comic: ' + error.message);
      return createBadRequset('Create comic is fail!!');
    }
  }

  async updateAvatartComic(
    comic_uuid: string,
    new_image: Express.Multer.File
  ): Promise<Http> {
    const comic = await this.comicRepository.findOne({
      where: { uuid: comic_uuid },
    });
    comic.image_url;

    if (!comic) return createBadRequsetNoMess('Comic is not exits!!');
    const imageOfComic = await this.imageService.updateImageUrl(
      comic.public_id,
      new_image,
      `comic/${comic.comic_name}`
    );

    const response = await this.comicRepository.update(
      { uuid: comic_uuid },
      { image_url: imageOfComic.image_url, public_id: imageOfComic.public_id }
    );

    if (!imageOfComic) return createBadRequsetNoMess('Upload image is fail!!');
    return createSuccessResponse(response, 'Update avatar comic');
  }

  async createDummyComic(): Promise<Http> {
    try {
      await this.refreshCache();
      const comics: Comic[] = [];

      const topics: Topic[] = await this.TopicService.getAllTopic();
      if (topics === undefined)
        return createBadRequsetNoMess('Topic is not exits!!');

      for (let i = 0; i < 10; i++) {
        const randomTopics = getRandomItemInObject(topics, 3);
        const time = fakerVI.date.past();
        const comic = new Comic({
          comic_name: faker.music.songName(),
          image_url: faker.image.urlLoremFlickr({
            category: 'cat',
          }),
          author: faker.person.lastName(),
          // created_at: time,
          // updated_at: time,
          description: fakerEN_US.lorem.paragraph(),

          topics: randomTopics,
        });

        comics.push(comic);
      }

      const response = await this.comicRepository.save(comics);
      if (!response) return createBadRequset('Create comic is fail!!');
      return createSuccessResponse(
        `${response.length} comic was created`,
        'Create comic'
      );
    } catch (error) {
      console.log('Something went wrong at create comic: ' + error.message);
      throw error;
    }
  }

  //get all comic
  async getAllComic(page: number = 1): Promise<Http> {
    try {
      const comic = await this.redis.get(`getallcomic${page}`);
      if (comic) {
        console.log('cache');
        return createSuccessResponse(
          JSON.parse(comic)['panigation'],
          'Get all comic'
        );
      }
      console.log('no cache');
      const total = await this.comicRepository.query(`WITH total_count AS (
        SELECT COUNT(*)::INT AS total_records
        FROM comic c
      )
      SELECT total_records FROM total_count;`);

      const data = await this.comicRepository.query(`
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
  GROUP BY c.uuid
  ORDER BY c.created_at DESC
  LIMIT 21 OFFSET ((${page} - 1) * 21)
  ;
      `);

      const panigation = panigationData(page, data, total[0].total_records);
      await this.redis.set(
        `getallcomic${page}`,
        JSON.stringify({
          panigation,
        }),
        'EX',
        60
      );
      return createSuccessResponse(panigation, 'Get all comic');
    } catch (error) {
      console.log('Something went wrong at get all comic: ' + error);
      return createBadRequset('Get all comic failed');
    }
  }

  async getAllComicV2(page: number) {
    const total = await this.comicRepository.query(`WITH total_count AS (
      SELECT COUNT(*)::INT AS total_records
      FROM comic c
    )
    SELECT total_records FROM total_count;`);

    const data = await this.comicRepository.query(`
    SELECT
    c.*,
    ARRAY_AGG(t.name) AS topics,
    CAST((
        SELECT COALESCE(SUM(chapter.views), 0)
        FROM chapter
        WHERE chapter.comic_uuid = c.uuid
    ) AS INT) AS total_views,
    CAST((
      SELECT COALESCE(AVG(rating.rating), 0)
      FROM rating
      WHERE rating.comic_uuid = c.uuid
  ) AS FLOAT) AS average_rating,
    CAST((
        SELECT COUNT(favorite.comic_uuid)
        FROM favorite
        WHERE favorite.comic_uuid = c.uuid
    ) AS INT) AS total_favorite
FROM
    comic c
LEFT JOIN
    comic_topic ct ON c.uuid = ct.comic_uuid
LEFT JOIN
    topic t ON ct.topic_uuid = t.uuid
GROUP BY c.uuid
ORDER BY c.created_at DESC
LIMIT 18 OFFSET ((${page} - 1) * 18)
;
    `);

    const panigation = panigationData(page, data, total[0].total_records);
    return panigation;
  }

  async getDetailComicByUuidV2(comic_uuid: string): Promise<any> {
    const query = await this.comicRepository.query(`
  SELECT
  c.*,
  ARRAY_AGG(t.name) AS topics,
  CAST((
      SELECT COALESCE(SUM(chapter.views), 0)
      FROM chapter
      WHERE chapter.comic_uuid = c.uuid
  ) AS INT) AS total_views,
  CAST((
    SELECT COALESCE(AVG(rating.rating), 0)
    FROM rating
    WHERE rating.comic_uuid = c.uuid
) AS FLOAT) AS average_rating,
  CAST((
      SELECT COUNT(favorite.comic_uuid)
      FROM favorite
      WHERE favorite.comic_uuid = c.uuid
  ) AS INT) AS total_favorite,
  CAST((
    SELECT COUNT('*')
    FROM chapter
    WHERE chapter.comic_uuid = c.uuid
  ) as INT) AS total_chapter
FROM
  comic c
LEFT JOIN
  comic_topic ct ON c.uuid = ct.comic_uuid
LEFT JOIN
  topic t ON ct.topic_uuid = t.uuid
WHERE c.uuid = '${comic_uuid}'
GROUP BY c.uuid
LIMIT 1
  `);
    return query;
  }

  getItems(page: string | number, count: string) {
    // vì param được truyền lấy từ url nên nó sẽ có kiểu string, vì vậy mình cần parse nó sang kiểu int
    page =
      parseInt(String(page)) < 1 || parseInt(String(page)) > 10
        ? 1
        : parseInt(String(page));
    const itemCount = parseInt(count) < 1 ? 5 : parseInt(count);
    const items = [];
    for (
      let index = page * itemCount - itemCount + 1;
      index <= page * itemCount;
      index++
    ) {
      items.push({ comic_name: `comic_name_${index}` });
    }
    return [items, { page, count, pageCount: 10 }];
  }

  async getAllComicforDev(): Promise<Comic[]> {
    const response = await this.comicRepository.find({
      take: 10,
    });
    return response;
  }

  async getDetailComicByUuid(user_uuid: string, uuid: string): Promise<any> {
    try {
      const response = await this.comicRepository.query(
        `SELECT c.*,
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
         FROM comic c
         LEFT JOIN favorite b ON c.uuid = b.comic_uuid AND b.user_uuid = '${user_uuid}'
         LEFT JOIN comic_topic ct ON c.uuid = ct.comic_uuid
         LEFT JOIN topic t ON ct.topic_uuid = t.uuid
         WHERE c.uuid = '${uuid}'
         GROUP BY c.uuid;`
      );

      if (!response[0] || response === null)
        return createBadRequsetNoMess('Comic is not exits!!');

      return createSuccessResponse(response, 'Get detail comic');
    } catch (error) {
      console.log('Something went wrong at get all comic: ' + error.message);
      throw error;
    }
  }

  //update comic by id
  async updateComicByUuId(updateComicDTO: UpdateComicDTO): Promise<Http> {
    const { author, comic_name, description, topics, uuid } = updateComicDTO;
    try {
      const isExits = await this.comicRepository.findOne({
        where: { uuid: uuid },
      });
      if (!isExits) return createBadRequsetNoMess('Comic is not exits!!');
      const topic = await this.TopicService.getAllTopicsByName(topics);
      console.log(topic);
      if (!topic) return createBadRequset('Topic is not exits!!');
      isExits.topics = topic;
      isExits.author = author;
      isExits.comic_name = comic_name;
      isExits.description = description;
      const response = await this.comicRepository.save(isExits);

      if (!response) return createBadRequset('Update comic is fail!!');
      return createSuccessResponse(response, 'Update comic');
    } catch (error) {
      console.log(error);
      return createBadRequset('Create comic is fail!!');
    }
  }

  async getAllComicByTopicName(topic_name: string[], page = 1): Promise<Http> {
    try {
      const perPage = 21;
      const skip = (page - 1) * perPage;
      const total = await this.comicRepository.query(`WITH total_count AS (
        SELECT COUNT(*)::INT AS total_records
        FROM comic c
        WHERE EXISTS (
          SELECT 1
          FROM comic_topic ct
          INNER JOIN topic t ON ct.topic_uuid = t.uuid
          WHERE ct.comic_uuid = c.uuid AND t.name = ANY(ARRAY[${topic_name.map(
            (item) => `'${item}'`
          )}])
        )
      )
      SELECT total_records FROM total_count;`);
      const response = await this.comicRepository.query(`
      SELECT c.*, ARRAY_AGG(t.name) AS topics,
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
      FROM comic c
      JOIN comic_topic ct ON c.uuid = ct.comic_uuid
      JOIN topic t ON ct.topic_uuid = t.uuid
      WHERE ct.comic_uuid = c.uuid AND t.name = ANY(ARRAY[${topic_name.map(
        (item) => `'${item}'`
      )}])
      GROUP BY c.uuid
      LIMIT ${perPage}
      OFFSET ${skip};
      `);
      if (!response) return createBadRequset('Comic is not exits!!');

      const results = panigationData(page, response, total[0].total_records);

      return createSuccessResponse(results, 'Get all comic by topic name');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllComicByName(comic_name: string, page: number = 1): Promise<Http> {
    try {
      if (!page) {
        page = 1;
      }
      console.log(page);
      const total = await this.comicRepository.query(`WITH total_count AS (
          SELECT COUNT(*)::INT AS total_records
          FROM comic c
        )
        SELECT total_records FROM total_count;`);

      const data = await this.comicRepository.query(`
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
  WHERE c.comic_name LIKE '%' || '${comic_name}' || '%'
  GROUP BY c.uuid
  ORDER BY c.created_at DESC
  LIMIT 21 OFFSET ((${page} - 1) * 21);
    ;
        `);

      const panigation = panigationData(page, data, total);

      return createSuccessResponse(panigation, 'Get all comic by  name');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //delete comic by id
  async deleteComicById(deleteComicDTO: DeleteComicDTO): Promise<Http> {
    try {
      const { uuid } = deleteComicDTO;
      const isExits = await this.comicRepository
        .find({
          where: { uuid: In(uuid) },
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
      if (!isExits) return createBadRequsetNoMess('Comic is not exits!!');
      const response = await this.comicRepository.delete(uuid);
      console.log(response);
      return createSuccessResponse(isExits, 'Delete comic');
    } catch (error) {
      return createBadRequsetNoMess(error);
    }
  }

  // async responseOfNews(comics: Comic[]): Promise<Comic[]> {
  //   const topics: any = comics.map((comic) =>
  //     comic?.topics.map((topic) => topic.name)
  //   );

  //   comics.forEach((comic, index) => {
  //     comic.topics = topics[index];
  //   });

  //   return comics;
  // }

  async refreshCache() {
    const keysCache = await this.redis.keys('*getallcomic*');
    if (keysCache.length > 0) {
      await this.redis.del(keysCache);
    }
  }

  // async updateComicView(comics: Comic[]): Promise<boolean> {
  //   const response = await this.comicRepository.save(comics);
  //   if (!response) return false;
  //   return true;
  // }

  async updateAllComicTopic(): Promise<Http> {
    const topics = await this.TopicService.getAllTopic();
    const comics = await this.comicRepository.find();
    if (!topics) return createBadRequsetNoMess('Topic is not exits!!');
    if (!comics) return createBadRequsetNoMess('Comic is not exits!!');

    for (const comic of comics) {
      // comic.topics = topics;

      comic.topics = getRandomItemInObject(topics, 3);
      console.log(comic);
      await this.comicRepository.save(comic);
    }
    return createSuccessResponse('Update all comic topic', 'Update topic');
  }

  async getTopViewComic(): Promise<Http> {
    try {
      const response = await this.comicRepository.query(`
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
  GROUP BY c.uuid
  ORDER BY views DESC
  LIMIT 20;
      `);
      if (!response) return createBadRequset('Comic is not exits!!');
      return createSuccessResponse(response, 'Get top view comic');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get top views fail');
    }
  }

  async getTopRatingComic(): Promise<any> {
    try {
      const topRating = await this.comicRepository.query(`
      SELECT c.*,
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
FROM comic c
LEFT JOIN comic_topic ct ON c.uuid = ct.comic_uuid
LEFT JOIN topic t ON ct.topic_uuid = t.uuid
GROUP BY c.uuid
ORDER BY rating DESC
LIMIT 20;
;
      `);

      if (!topRating) return createBadRequset('Get top rating fail');

      return createSuccessResponse(topRating, 'Get top rating comic');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get top rating fail');
    }
  }

  async getTopFavoriteComic(): Promise<any> {
    try {
      const topRating = await this.comicRepository.query(`
      SELECT c.*,
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
FROM comic c
LEFT JOIN comic_topic ct ON c.uuid = ct.comic_uuid
LEFT JOIN topic t ON ct.topic_uuid = t.uuid
GROUP BY c.uuid
ORDER BY favorite DESC
LIMIT 20;
;
      `);

      if (!topRating) return createBadRequset('Get top rating fail');

      return createSuccessResponse(topRating, 'Get top rating comic');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get top rating fail');
    }
  }

  // async editComic(comic_uuid: string, editComicDTO: any): Promise<any> {
  //   const { comic_name, description, author, topic_uuid } = editComicDTO;
  //   try {
  //     const comic = await this.comicRepository.findOne({
  //       where: { uuid: comic_uuid },
  //     });
  //     if (!comic) return createBadRequsetNoMess('Comic is not exits!!');
  //     const topics = await this.TopicService.getAllTopicsByUuid(topic_uuid);
  //     if (!topics) return createBadRequsetNoMess('Topic is not exits!!');
  //     comic.comic_name = comic_name;
  //     comic.description = description;
  //     comic.author = author;
  //     comic.topics = topics;
  //     const response = await this.comicRepository.save(comic);
  //     if (!response) return createBadRequset('Edit comic is fail!!');
  //     return createSuccessResponse(response, 'Edit comic');
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }
}
