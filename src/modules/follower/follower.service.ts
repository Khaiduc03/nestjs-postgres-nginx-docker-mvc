import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
} from 'src/common';
import { Follower, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // create follower

  async createFollowing(
    following_uuid: string,
    follower_uuid: string
  ): Promise<any> {
    try {
      const isExist = await this.followerRepository.query(`
        SELECT * FROM follower WHERE following_uuid = '${following_uuid}' AND follower_uuid = '${follower_uuid}';
      `);

      if (isExist.length > 0) {
        const response = await this.followerRepository.query(`
        DELETE FROM follower WHERE following_uuid = '${following_uuid}' AND follower_uuid = '${follower_uuid}';
        `);
        return createSuccessResponse(response, 'Delete follower');
      }

      const newFollower = new Follower({
        following_uuid: following_uuid,
        follower_uuid: follower_uuid,
      });
      const response = await this.followerRepository.save(newFollower);

      const following = await this.followerRepository.query(`
      SELECT f.uuid ,
      f.following_uuid as user_following_uuid,
      u.uuid as user_follower_uuid,
      u.fullname, u.image_url, 
      u.email
      FROM follower f
      LEFT JOIN "user" u ON f.follower_uuid = u.uuid
      WHERE f.following_uuid = '${response.following_uuid}'
      ORDER BY f.created_at DESC
      LIMIT 1
      ;
      `);

      return createSuccessResponse(following[0], 'Create follower');
    } catch (error) {
      return createBadRequsetNoMess('User not found or something wrong');
    }
  }

  //find user by uuid

  async getYourFollowers(user_uuid: string) {
    const follower = await this.followerRepository.query(`
    SELECT f.uuid,
    f.follower_uuid as user_follower_uuid,
    u.uuid as user_following_uuid,
    u.fullname, u.image_url,
    u.email,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM follower f2
            WHERE f2.following_uuid = '${user_uuid}' AND f2.follower_uuid = f.following_uuid
        ) THEN true
        ELSE false
    END AS is_following
    FROM follower f
    LEFT JOIN "user" u ON f.following_uuid = u.uuid
    WHERE f.follower_uuid = '${user_uuid}';

    `);

    const following = await this.followerRepository.query(`
    SELECT f.uuid ,
    f.following_uuid as user_following_uuid,
    u.uuid as user_follower_uuid,
    u.fullname, u.image_url, 
    u.email
    FROM follower f
    LEFT JOIN "user" u ON f.follower_uuid = u.uuid
    WHERE f.following_uuid = '${user_uuid}';
    `);

    if (!follower && !following) return createBadRequset('Get your follower');

    const data = {
      follower: follower,
      following: following,
    };

    return createSuccessResponse(data, 'Get your follower');
  }

  // delete follower by uuid

  async deleteFollower(user_uuid: string, follower_uuid: string) {
    try {
      // const isExist = await this.followerRepository.findOne({
      //   where: {
      //     follower_uuid: user_uuid,
      //     following_uuid: follower_uuid,
      //   },

      // });
      const isExist = await this.followerRepository.query(`
        SELECT * FROM follower WHERE following_uuid = '${follower_uuid}' AND follower_uuid = '${user_uuid}';
      `);
      console.log(isExist);
      if (!isExist) return createBadRequsetNoMess('Not found follower');
      const response = await this.followerRepository.delete(isExist);
      return createSuccessResponse(response, 'Delete follower');
    } catch (error) {
      console.log(error);
      return createBadRequsetNoMess('Error: ' + error);
    }
  }
}
