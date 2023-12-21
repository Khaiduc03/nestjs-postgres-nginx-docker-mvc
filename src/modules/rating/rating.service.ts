import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from 'src/entities/rating.entity';
import { Repository } from 'typeorm';
import { ComicService } from '../comic';
import { CreateRatingDto, CreateRatingResponse } from './dto';
import { UserService } from '../user';
import {
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
} from 'src/common';
import { faker, fakerEN_US } from '@faker-js/faker';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>
  ) {}

  //get all rating allow comic uuid

  async createRating(createRatingDto: CreateRatingDto) {
    try {
      const { rating, comic_uuid, user, comment } = createRatingDto;

      const isExistComic = await this.ratingRepository.query(
        `SELECT * FROM comic WHERE uuid = '${comic_uuid}'`
      );
      //console.log(isExist);
      if (!isExistComic[0]) return createBadRequset('Comic is not exist exist');

      const isExistRating = await this.ratingRepository.query(`
      SELECT * FROM rating WHERE comic_uuid = '${comic_uuid}' AND user_uuid = '${user.uuid}'
      `);
      if (isExistRating[0])
        return createBadRequsetNoMess('You have been rated this comic');

      if (rating < 0 || rating > 5)
        return createBadRequsetNoMess('Rating must be between 0 and 5');

      const newRating = new Rating({
        comic_uuid: comic_uuid,
        user_uuid: user.uuid,
        rating: Number(rating),
        comment: comment,
      });
      const res = await this.ratingRepository.save(newRating);

      const customRes = new CreateRatingResponse(res, user);

      return createSuccessResponse(customRes, 'Create rating success');
    } catch (error) {
      console.log(error);
      return createBadRequsetNoMess('Error create rating:' + error);
    }
  }

  async getAllRatingByComicUuid(comic_uuid: string, user_uuid: string) {
    try {
      const res = await this.ratingRepository.query(`
      SELECT r.*,
      u.fullname as user_fullname,
      u.image_url as user_avatar,
      CASE WHEN rl.user_uuid IS NOT NULL THEN true ELSE false END as is_like,
CAST((SELECT COUNT(*) FROM rating_like WHERE rating_uuid = r.uuid) AS INT) AS like_count
      FROM rating r
      LEFT JOIN "user" u ON r.user_uuid = u.uuid
      LEFT JOIN rating_like rl ON r.uuid = rl.rating_uuid AND rl.user_uuid = '${user_uuid}'
      WHERE comic_uuid = '${comic_uuid}'
      `);
      return createSuccessResponse(res, 'Get all rating success');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all rating');
    }
  }

  async getRatingByUuid(rating_uuid: string, user_uuid: string) {
    try {
      const res = await this.ratingRepository.query(`
      SELECT r.*,
      u.fullname as user_fullname,
      u.image_url as user_avatar,
      CASE WHEN rl.user_uuid IS NOT NULL THEN true ELSE false END as is_like,
CAST((SELECT COUNT(*) FROM rating_like WHERE rating_uuid = r.uuid) AS INT) AS like_count
      FROM rating r
      LEFT JOIN "user" u ON r.user_uuid = u.uuid
      LEFT JOIN rating_like rl ON r.uuid = rl.rating_uuid AND rl.user_uuid = '${user_uuid}'
      WHERE r.uuid = '${rating_uuid}'
      LIMIT 1
      `);
      if (res.length === 0)
        return createBadRequsetNoMess('Rating is not exist');
      return createSuccessResponse(res[0], 'Get all rating success');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get rating by uuid');
    }
  }

  async deleteRating(user_uuid: string, rating_uuid: string) {
    console.log(user_uuid);
    try {
      const isExist = await this.ratingRepository.query(`
      SELECT * FROM rating WHERE uuid = '${rating_uuid}' AND user_uuid = '${user_uuid}'
      `);
      if (!isExist[0]) return createBadRequsetNoMess('Rating is not exist');
      await this.ratingRepository.query(`
      DELETE FROM rating WHERE uuid = '${rating_uuid}' AND user_uuid = '${user_uuid}'
      `);
      return createSuccessResponse(null, 'Delete rating success');
    } catch (error) {
      console.log(error);
      return createBadRequset('Delete rating');
    }
  }

  async likeRating(user_uuid: string, rating_uuid: string) {
    try {
      const isExist = await this.ratingRepository.query(`
      SELECT * FROM rating WHERE uuid = '${rating_uuid}'
      `);
      if (!isExist[0]) return createBadRequsetNoMess('Rating is not exist');
      const isExistLike = await this.ratingRepository.query(`
      SELECT * FROM rating_like WHERE rating_uuid = '${rating_uuid}' AND user_uuid = '${user_uuid}'
      `);
      if (isExistLike[0])
        return createBadRequsetNoMess('You have been liked this rating');
      await this.ratingRepository.query(`
      INSERT INTO rating_like (user_uuid,rating_uuid) VALUES ('${user_uuid}','${rating_uuid}')
      `);
      return createSuccessResponse(true, 'Like rating success');
    } catch (error) {
      console.log(error);
      return createBadRequset('Like rating');
    }
  }

  async unlikeRating(user_uuid: string, rating_uuid: string) {
    try {
      const isExist = await this.ratingRepository.query(`
      SELECT * FROM rating WHERE uuid = '${rating_uuid}'
      `);
      if (!isExist[0]) return createBadRequsetNoMess('Rating is not exist');
      const isExistLike = await this.ratingRepository.query(`
      SELECT * FROM rating_like WHERE rating_uuid = '${rating_uuid}' AND user_uuid = '${user_uuid}'
      `);
      if (!isExistLike[0])
        return createBadRequsetNoMess('You have not been liked this rating');
      await this.ratingRepository.query(`
      DELETE FROM rating_like WHERE user_uuid = '${user_uuid}' AND rating_uuid = '${rating_uuid}'
      `);
      return createSuccessResponse(false, 'Unlike rating success');
    } catch (error) {
      console.log(error);
      return createBadRequset('Unlike rating');
    }
  }

  async createDummyRating() {
    const getAllComic = await this.ratingRepository.query(`
    SELECT uuid FROM comic
    `);
    const getAllUser = await this.ratingRepository.query(`
    SELECT uuid FROM "user"
    `);

    for (const comic of getAllComic) {
      for (const user of getAllUser) {
        const newRating = new Rating({
          comic_uuid: comic.uuid,
          user_uuid: user.uuid,
          rating: Math.random() < 0.6 ? 5 : Math.floor(Math.random() * 4) + 1,
          comment: fakerEN_US.lorem.paragraph(),
        });
        await this.ratingRepository.save(newRating);
      }
    }

    return createSuccessResponse(null, 'Create dummy rating success');
  }

  getChartRating() {
    return this.ratingRepository.query(`
    SELECT rating, COUNT(*) as count FROM rating GROUP BY rating ORDER BY rating ASC
    `);
  }

  async getChartRatingByComicUuid(comic_uuid: string) {
    try {
      const chart = await this.ratingRepository.query(`
    SELECT
    CAST(AVG(rating) AS FLOAT) AS average_rating,
    CAST(COUNT(*) AS INT) AS total_rating,
    CAST(COUNT(CASE WHEN rating = 1 THEN 1 END) AS INT) AS rating_1,
    CAST(COUNT(CASE WHEN rating = 2 THEN 1 END) AS INT) AS rating_2,
    CAST(COUNT(CASE WHEN rating = 3 THEN 1 END) AS INT) AS rating_3,
    CAST(COUNT(CASE WHEN rating = 4 THEN 1 END) AS INT) AS rating_4,
    CAST(COUNT(CASE WHEN rating = 5 THEN 1 END) AS INT) AS rating_5
  FROM
    Rating
  WHERE
    comic_uuid = '${comic_uuid}';
    `);

      return createSuccessResponse(chart[0], 'Get chart rating success');
    } catch (error) {
      return createBadRequset('Get chart rating');
    }
  }
}
