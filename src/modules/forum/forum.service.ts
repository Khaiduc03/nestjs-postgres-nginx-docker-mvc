import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Forum } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateForumDTO, ResponseForumModel } from './dto';
import { Forum_image } from 'src/entities/forum_image.entity';
import { CloudService } from '../cloud';
import {
  createBadRequset,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { faker } from '@faker-js/faker';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(Forum_image)
    private readonly forumImageRepository: Repository<Forum_image>,
    // @InjectRepository(Forum_Like)
    // private readonly forumLikeRepository: Repository<Forum_Like>,
    private readonly cloudService: CloudService
  ) {}

  //create forum
  async createNewPost(createForumDto: CreateForumDTO): Promise<any> {
    const { content, images, status, user } = createForumDto;
    const ImagesUrl = [];
    const newForum = new Forum({
      content: content,
      status: status,
      user_uuid: user.uuid,
    });
    const forum = await this.forumRepository.save(newForum);
    if (forum) {
      if (images.length > 0) {
        const uploadImages = await this.cloudService.uploadMultipleFilesv2(
          images
        );
        if (uploadImages) {
          for (const newImageForum of uploadImages) {
            const forumImage = new Forum_image({
              url: newImageForum.url,
              secure_url: newImageForum.secure_url,
              forum_uuid: forum.uuid,
              public_id: newImageForum.public_id,
            });

            const res = await this.forumImageRepository.save(forumImage);
            ImagesUrl.push(res.url);
            if (!res) return createBadRequset('Upload images');
          }
        }
      }
    } else {
      return createBadRequset('Create post fail');
    }
    const responseForumModel = new ResponseForumModel(forum, ImagesUrl, user);
    return createSuccessResponse(responseForumModel, 'Create post');
  }

  async getAllPostForums(page = 1, user_uuid: string): Promise<any> {
    try {
      const totalItem = await this.forumRepository.query(`
      SELECT COUNT(*) AS INT FROM forum;
      `);
      console.log(totalItem[0].int);
      const res = await this.forumRepository.query(`
  SELECT f.*,
  u.fullname AS user_fullname,
  u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM forum_like fl WHERE fl.forum_uuid = f.uuid) AS INT) AS like_count,
  CAST((SELECT COUNT(*) FROM comment WHERE forum_uuid = f.uuid) AS INT) AS comment_count,
  ARRAY_AGG(fi.url) AS images,
  CASE WHEN fl.user_uuid IS NULL THEN FALSE ELSE TRUE END AS is_liked
  FROM forum f
  LEFT JOIN "user" u ON u.uuid = f.user_uuid
  LEFT JOIN forum_image fi ON fi.forum_uuid = f.uuid
  LEFT JOIN forum_like fl ON fl.forum_uuid = f.uuid AND fl.user_uuid = '${user_uuid}'
  GROUP BY f.uuid,u.fullname,u.image_url,fl.user_uuid
  ORDER BY f.created_at DESC
  LIMIT 10 OFFSET ((${page} - 1) * 10);
  
`);
      const data = panigationData(page, res, Number(totalItem[0].int), 10);
      return createSuccessResponse(data, 'Get all post');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all post');
    }
  }

  async getAllPostForumsv2(page = 1): Promise<any> {
    try {
      const totalItem = await this.forumRepository.query(`
      SELECT COUNT(*) AS INT FROM forum;
      `);
      const res = await this.forumRepository.query(`
  SELECT f.*,
  u.fullname AS user_fullname,
  u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM forum_like fl WHERE fl.forum_uuid = f.uuid) AS INT) AS like_count,
  CAST((SELECT COUNT(*) FROM comment WHERE forum_uuid = f.uuid) AS INT) AS comment_count,
  ARRAY_AGG(fi.url) AS images
  FROM forum f
  LEFT JOIN "user" u ON u.uuid = f.user_uuid
  LEFT JOIN forum_image fi ON fi.forum_uuid = f.uuid
  LEFT JOIN comment c ON c.forum_uuid = f.uuid
  GROUP BY f.uuid,u.fullname,u.image_url
  ORDER BY f.created_at DESC
  LIMIT 10 OFFSET ((${page} - 1) * 10);
`);
      const data = panigationData(page, res, Number(totalItem[0].int), 10);
      return createSuccessResponse(data, 'Get all post');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all post');
    }
  }

  async getAllPostForumsOfUser(page = 1, user_uuid: string): Promise<any> {
    try {
      const totalItem = await this.forumRepository.query(`
      SELECT COUNT(*) AS INT FROM forum WHERE user_uuid = '${user_uuid}';
      `);

      const res = await this.forumRepository.query(`
  SELECT f.*,
  u.fullname AS user_fullname,
  u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM forum_like fl WHERE fl.forum_uuid = f.uuid) AS INT) AS like_count,
  CAST((SELECT COUNT(*) FROM comment WHERE forum_uuid = f.uuid) AS INT) AS comment_count,
  ARRAY_AGG(fi.url) AS images,
  CASE WHEN fl.user_uuid IS NULL THEN FALSE ELSE TRUE END AS is_liked
  FROM forum f
  LEFT JOIN "user" u ON u.uuid = f.user_uuid
  LEFT JOIN forum_image fi ON fi.forum_uuid = f.uuid
  LEFT JOIN forum_like fl ON fl.forum_uuid = f.uuid AND fl.user_uuid = '${user_uuid}'
  LEFT JOIN comment c ON c.forum_uuid = f.uuid
  WHERE f.user_uuid = '${user_uuid}'
  GROUP BY f.uuid,u.fullname,u.image_url,fl.user_uuid
  ORDER BY f.created_at DESC
  LIMIT 10 OFFSET ((${page} - 1) * 10);
  
`);
      const data = panigationData(page, res, Number(totalItem[0].int), 10);
      return createSuccessResponse(data, 'Get all post');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all post');
    }
  }

  async getPostForumByUuid(post_uuid: string, user_uuid: string): Promise<any> {
    try {
      const res = await this.forumRepository.query(
        `
      SELECT f.*,
      u.fullname AS user_fullname,
      u.image_url AS user_avatar,
      CAST((SELECT COUNT(*) FROM forum_like WHERE forum_uuid = f.uuid) AS INT) AS like_count,
      CAST((SELECT COUNT(*) FROM comment WHERE forum_uuid = f.uuid) AS INT) AS comment_count,
      ARRAY_AGG(fi.url) AS images,
      CASE WHEN fl.user_uuid IS NULL THEN FALSE ELSE TRUE END AS is_liked
      FROM forum f
      LEFT JOIN "user" u ON u.uuid = f.user_uuid
      LEFT JOIN forum_image fi ON fi.forum_uuid = f.uuid
      LEFT JOIN forum_like fl ON fl.forum_uuid = f.uuid AND fl.user_uuid = '${user_uuid}'
      WHERE f.uuid = '${post_uuid}'
      GROUP BY f.uuid,u.fullname,u.image_url,fl.user_uuid
      ORDER BY f.created_at DESC
      limit 1
      ;
    `
      );
      if (res.length === 0) return createBadRequset('Get post by uuid');

      return createSuccessResponse(res[0], 'Get post by uuid');
    } catch (error) {
      return createBadRequset('Get post by uuid');
    }
  }

  async likePostForum(user_uuid: string, forum_uuid: string): Promise<any> {
    try {
      const res = await this.forumRepository.query(`
      INSERT INTO forum_like (user_uuid,forum_uuid) VALUES ('${user_uuid}','${forum_uuid}')
      `);
      if (!res) return createBadRequset('Like post');
      return createSuccessResponse(true, 'Like post');
    } catch (error) {
      return createBadRequset('Like post');
    }
  }

  async unlikePostFourm(user_uuid: string, forum_uuid: string): Promise<any> {
    try {
      const res = await this.forumRepository.query(`
      DELETE FROM forum_like WHERE user_uuid = '${user_uuid}' AND forum_uuid = '${forum_uuid}'
`);
      if (res[1] == 0) return createBadRequset('Unlike post');
      return createSuccessResponse(false, 'Unlike post');
    } catch (error) {
      return createBadRequset('Unlike post');
    }
  }

  async deletePostForum(forum_uuid: string, user_uuid: string): Promise<any> {
    try {
      const forum = await this.forumRepository.query(`
      SELECT * FROM forum WHERE uuid = '${forum_uuid}' AND  user_uuid = '${user_uuid}'
      `);
      if (!forum[0]) return createBadRequset('Delete post1');

      const res = await this.forumRepository.delete({ uuid: forum_uuid });
      if (res['affected'] === 0) return createBadRequset('Delete post3');
      return createSuccessResponse(res, 'Delete post4');
    } catch (error) {
      return createBadRequset('Delete post5');
    }
  }

  async createDummyForum() {
    const users = await this.forumRepository.query(`
    SELECT uuid FROM "user" limit 20;
    `);
    for (const user of users) {
      const newForum = new Forum({
        user_uuid: user.uuid,
        content: faker.lorem.paragraph(),
        status: true,
      });

      const forum = await this.forumRepository.save(newForum);

      for (let i = 0; i < 3; i++) {
        const url = faker.image.urlLoremFlickr({
          category: 'cat',
        });
        const newForumImage = new Forum_image({
          forum_uuid: forum.uuid,
          url: url,
          secure_url: url,
          public_id: url,
        });
        await this.forumImageRepository.save(newForumImage);
      }
    }
    return createSuccessResponse('Create dummy forum', 'Create dummy forum');
  }

  async deletePostForumByAdmin(forum_uuid: string): Promise<any> {
    try {
      const res = await this.forumRepository.delete({ uuid: forum_uuid });
      console.log(res);
      if (res['affected'] === 0) return createBadRequset('Post is not exits');
      return createSuccessResponse(res, 'Delete post');
    } catch (error) {
      return createBadRequset('Delete post5');
    }
  }
}
