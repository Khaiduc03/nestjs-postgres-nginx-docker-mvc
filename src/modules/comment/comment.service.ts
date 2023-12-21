import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateCommentChapterDTO, CreateCommentForumDTO } from './dto';
import {
  Http,
  createBadRequset,
  createSuccessResponse,
  panigationData,
} from 'src/common';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {}

  async createCommentChapter(
    createCommentDTO: CreateCommentChapterDTO
  ): Promise<Http> {
    try {
      const { chapter_uuid, user_uuid, comment, parents_comment_uuid } =
        createCommentDTO;
      let type = 'chapter';

      if (parents_comment_uuid != null) {
        type = 're_comment';
      }

      const newComment = new Comment({
        chapter_uuid: chapter_uuid,
        user_uuid: user_uuid,
        comment: comment,
        parents_comment_uuid: parents_comment_uuid,
        type: type,
      });
      const response = await this.commentRepository.save(newComment);
      const query = await this.commentRepository.query(`
  SELECT c.*, u.fullname, u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM comment cp WHERE cp.parents_comment_uuid::uuid = c.uuid::uuid) AS INT) AS re_comment_count,
  CAST((SELECT COUNT(*) FROM comment_like cl WHERE cl.comment_uuid::uuid = c.uuid::uuid) AS INT) AS like_count,
  CASE WHEN cl2.user_uuid IS NULL THEN false ELSE true END AS is_like
FROM comment c
LEFT JOIN "user" u ON u.uuid = c.user_uuid
LEFT JOIN "comment_like" cl2 ON cl2.comment_uuid = c.uuid AND cl2.user_uuid = '${user_uuid}'
WHERE c.uuid = '${response.uuid}'
ORDER BY c.created_at DESC
LIMIT 1;
`);

      return createSuccessResponse(query[0], 'Create comment chapter');
    } catch (error) {
      return createBadRequset('Create comment chapter');
    }
  }

  async createCommentForum(
    createCommentDTO: CreateCommentForumDTO
  ): Promise<Http> {
    try {
      const { forum_uuid, user_uuid, comment, parents_comment_uuid } =
        createCommentDTO;
      let type = 'forum';
      if (parents_comment_uuid != null) {
        type = 're_comment';
      }
      const newComment = new Comment({
        user_uuid: user_uuid,
        comment: comment,
        forum_uuid: forum_uuid,
        parents_comment_uuid: parents_comment_uuid,
        type: type,
      });
      const response = await this.commentRepository.save(newComment);
      const query = await this.commentRepository.query(`
  SELECT c.*, u.fullname, u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM comment cp WHERE cp.parents_comment_uuid::uuid = c.uuid::uuid) AS INT) AS re_comment_count,
  CAST((SELECT COUNT(*) FROM comment_like cl WHERE cl.comment_uuid::uuid = c.uuid::uuid) AS INT) AS like_count,
  CASE WHEN cl2.user_uuid IS NULL THEN false ELSE true END AS is_like
FROM comment c
LEFT JOIN "user" u ON u.uuid = c.user_uuid
LEFT JOIN "comment_like" cl2 ON cl2.comment_uuid = c.uuid AND cl2.user_uuid = '${user_uuid}'
WHERE c.uuid = '${response.uuid}'
ORDER BY c.created_at DESC
LIMIT 1;
`);
      return createSuccessResponse(query[0], 'Create comment forum');
    } catch (error) {
      return createBadRequset('Create comment forum');
    }
  }

  async getAllCommentsChapter(
    chapter_uuid: string,
    page: number,
    user_uuid: string
  ): Promise<Http> {
    try {
      const totalData = await this.commentRepository.query(`
      SELECT COUNT(*) FROM comment WHERE chapter_uuid = '${chapter_uuid}' AND parents_comment_uuid IS NULL AND type = 'chapter';
      `);

      const response = await this.commentRepository.query(`
      SELECT c.*, u.fullname, u.image_url AS user_avatar,
      CAST((SELECT COUNT(*) FROM comment cp WHERE cp.parents_comment_uuid::uuid = c.uuid::uuid) AS INT) AS re_comment_count,
      CAST((SELECT COUNT(*) FROM comment_like cl WHERE cl.comment_uuid::uuid = c.uuid::uuid) AS INT) AS like_count,
      CASE WHEN cl2.user_uuid IS NULL THEN false ELSE true END AS is_like
    FROM comment c
    LEFT JOIN "user" u ON u.uuid = c.user_uuid
    LEFT JOIN "comment_like" cl2 ON cl2.comment_uuid = c.uuid AND cl2.user_uuid = '${user_uuid}'
    WHERE chapter_uuid = '${chapter_uuid}' AND parents_comment_uuid IS NULL AND type = 'chapter'
    ORDER BY c.created_at DESC
    LIMIT 21 OFFSET ((${page} - 1) * 21);
  `);
      const data = panigationData(page, response, Number(totalData[0].count));
      return createSuccessResponse(data, 'Get all comments chapter');
    } catch (error) {
      return createBadRequset('Get all comments chapter');
    }
  }

  async getAllCommentsForum(
    forum_uuid: string,
    page: number,
    user_uuid: string
  ): Promise<Http> {
    try {
      const totalData = await this.commentRepository.query(`
      SELECT COUNT(*) FROM comment WHERE forum_uuid = '${forum_uuid}' AND parents_comment_uuid IS NULL AND type = 'forum';
      `);

      const response = await this.commentRepository.query(`
  SELECT c.*, u.fullname, u.image_url AS user_avatar,
  CAST((SELECT COUNT(*) FROM comment cp WHERE cp.parents_comment_uuid::uuid = c.uuid::uuid) AS INT) AS re_comment_count,
  CAST((SELECT COUNT(*) FROM comment_like cl WHERE cl.comment_uuid::uuid = c.uuid::uuid) AS INT) AS like_count,
  CASE WHEN cl2.user_uuid IS NULL THEN false ELSE true END AS is_like
FROM comment c
LEFT JOIN "user" u ON u.uuid = c.user_uuid
LEFT JOIN "comment_like" cl2 ON cl2.comment_uuid = c.uuid AND cl2.user_uuid = '${user_uuid}'
WHERE forum_uuid = '${forum_uuid}' AND parents_comment_uuid IS NULL AND type = 'forum'
ORDER BY c.created_at DESC
LIMIT 21 OFFSET ((${page} - 1) * 21);

  `);
      console.log(totalData);
      const data = panigationData(page, response, Number(totalData[0].count));
      return createSuccessResponse(data, 'Get all comments forum');
    } catch (error) {
      console.log(error);
      return createBadRequset('Get all comments forum');
    }
  }

  async getAllReComments(
    comment_uuid: string,
    page: number,
    user_uuid: string
  ): Promise<Http> {
    try {
      console.log(comment_uuid);
      const totalData = await this.commentRepository.query(`
      SELECT COUNT(*) FROM comment WHERE parents_comment_uuid = '${comment_uuid}' AND type = 're_comment';
      `);

      const response = await this.commentRepository.query(`
      SELECT c.*, u.fullname, u.image_url AS user_avatar,
      CAST((SELECT COUNT(*) FROM comment_like cl WHERE cl.comment_uuid::uuid = c.uuid::uuid) AS INT) AS like_count,
      cl2.user_uuid AS like_user_uuid,
      CASE WHEN cl2.user_uuid IS NULL THEN false ELSE true END AS is_like
      FROM comment c
      LEFT JOIN "user" u ON u.uuid = c.user_uuid
      LEFT JOIN "comment_like" cl2 ON cl2.comment_uuid = c.uuid AND cl2.user_uuid = '${user_uuid}' 
      WHERE parents_comment_uuid = '${comment_uuid}' AND type = 're_comment'
      ORDER BY c.created_at DESC
      LIMIT 21 OFFSET ((${page} - 1) * 21)
      ;
    `);
      const data = panigationData(page, response, Number(totalData[0].count));
      return createSuccessResponse(data, 'Get all re comments chapter');
    } catch (error) {
      return createBadRequset('Get all re comments chapter');
    }
  }

  async addLikeComment(comment_uuid: string, user_uuid: string): Promise<any> {
    try {
      const response = await this.commentRepository.query(`
    INSERT INTO comment_like (comment_uuid, user_uuid) VALUES ('${comment_uuid}', '${user_uuid}');
    `);

      return createSuccessResponse(true, 'Add like comment');
    } catch (error) {
      return createBadRequset('Add like comment');
    }
  }

  async removeLikeComment(
    comment_uuid: string,
    user_uuid: string
  ): Promise<any> {
    try {
      const response = await this.commentRepository.query(`
  DELETE FROM comment_like WHERE comment_uuid = '${comment_uuid}' AND user_uuid = '${user_uuid}';
  `);

      if (response[1] == 0) return createBadRequset('Remove like comment');

      return createSuccessResponse(false, 'Remove like comment');
    } catch (error) {
      return createBadRequset('Remove like comment');
    }
  }

  async deleteComment(comment_uuid: string, user_uuid: string): Promise<any> {
    try {
      const checkUser = await this.commentRepository.query(`
      SELECT user_uuid FROM comment WHERE uuid = '${comment_uuid}';
      `);
      if (checkUser[0].user_uuid != user_uuid)
        return createBadRequset(
          "You don't have permission to delete this comment"
        );
      const response = await this.commentRepository.delete({
        uuid: comment_uuid,
      });

      return createSuccessResponse(response, 'Delete comment');
    } catch (error) {
      return createBadRequset('Delete comment');
    }
  }

  // async getAllComments(): Promise<any> {

  // }
}
