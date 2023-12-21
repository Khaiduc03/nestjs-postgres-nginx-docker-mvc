import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { CloudService } from '../cloud';
import { GetUserDTO, UpdatePassword, UpdateProfileDTO } from './dto';
import { UpdatePasswordDTO } from 'src/auth/dto';
import { comparePassword, hashPassword } from 'src/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloud: CloudService
  ) {}

  //get profile user
  async getProfileUser(uuid: string): Promise<Partial<User>> {
    try {
      const profile = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.wallet', 'wallet')
        .where('user.uuid = :uuid', { uuid })
        .getOne();

      if (!profile) return null;
      const { password, ...profileWithoutPassword } = profile;
      return profileWithoutPassword;
    } catch (error) {
      console.log('Something went wrong at get profile user: ' + error.message);
    }
  }

  // get user by uuid
  async getUserById(user_uuid: string): Promise<Partial<Http>> {
    try {
      const user = await this.userRepository.query(`
      SELECT uuid, email, fullname, phone,summary,gender,status,dob, image_url,
      CAST((SELECT COUNT(*) FROM follower WHERE follower_uuid = u.uuid) AS INT) AS followerCount,
      CAST((SELECT COUNT(*) FROM follower WHERE following_uuid = u.uuid) AS INT) AS followingCount
      FROM "user" u 
      WHERE u.uuid = '${user_uuid}'
      `);

      if (!user) return createBadRequset('Get user by id');

      return createSuccessResponse(user, 'Get user by id');
    } catch (error) {
      console.log('Something went wrong at get user by uuid: ' + error.message);
      return createBadRequset('Get user by id');
    }
  }

  // get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.query(`
        SELECT uuid, email, fullname, phone,summary,gender,status,dob, image_url,
        CAST((SELECT COUNT(*) FROM follower WHERE follower_uuid = u.uuid) AS INT) AS followerCount,
        CAST((SELECT COUNT(*) FROM follower WHERE following_uuid = u.uuid) AS INT) AS followingCount
        FROM "user" u        
      `);

      if (!users) return null;
      return users;
    } catch (error) {
      console.log('Something went wrong at get all users: ' + error.message);
      throw error;
    }
  }

  async getAllUsersv2(page: number = 1) {
    try {
      const users = await this.userRepository.query(`
        SELECT uuid, email, fullname, phone,summary,gender,status,dob, image_url,
        created_at,"isBanned",
        CAST((SELECT COUNT(*) FROM follower WHERE follower_uuid = u.uuid) AS INT) AS followerCount,
        CAST((SELECT COUNT(*) FROM follower WHERE following_uuid = u.uuid) AS INT) AS followingCount,
        CAST((SELECT COUNT(*) FROM forum WHERE user_uuid = u.uuid) AS INT) AS post_count
        FROM "user" u 
        ORDER BY post_count DESC ,"isBanned" DESC
        LIMIT 21 OFFSET ${(page - 1) * 21}
       
      `);
      const total = await this.userRepository.query(`
      SELECT COUNT(*) FROM "user"
      `);
      const data = panigationData(page, users, total[0].count);
      console.log(data);
      if (!users) return null;
      return data;
    } catch (error) {
      console.log('Something went wrong at get all users: ' + error.message);
      throw error;
    }
  }

  async getUserByUuid(user_id: string): Promise<Http> {
    try {
      const user = await this.userRepository.query(`
      SELECT
      uuid,
      email,
      fullname,
      phone,
      summary,
      image_url,
      gender,
      status,
      dob,
      "isUpdate",
      "isPassword",
      roles,
      CAST((SELECT COUNT(*) FROM follower WHERE follower_uuid = '${user_id}') AS INT) AS followerCount,
      CAST((SELECT COUNT(*) FROM follower WHERE following_uuid = '${user_id}') AS INT) AS followingCount
      FROM "user"
      WHERE "uuid" = '${user_id}';
      `);
      if (!user) return createBadRequset('Get detail user');
      return createSuccessResponse(user, 'Get detail user');
    } catch (error) {
      console.log('Something went wrong at get detail user: ' + error.message);
      throw error;
    }
  }

  async getFollowerUser(user_id: string): Promise<Http> {
    const user = await this.userRepository.query(`
    (SELECT
      f.uuid as follower_uuid,
      u.email,
      u.fullname
    FROM follower f
    INNER JOIN "user" u ON f.following_uuid = u.uuid
    WHERE f.follower_uuid = '${user_id}')
    UNION
    (SELECT
      f.uuid as follower_uuid,
      u.email,
      u.fullname
    FROM follower f
    INNER JOIN "user" u ON f.follower_uuid = u.uuid
    WHERE f.following_uuid = '${user_id}')
    
    `);
    if (!user) return createBadRequset('Get detail user');
    return createSuccessResponse(user, 'Get detail user');
  }

  async getDetailUser(user_id: string): Promise<Http> {
    try {
      const user = await this.userRepository.query(`
      SELECT
      uuid,
      email,
      fullname,
      phone,
      summary,
      image_url,
      gender,
      status,
      dob,
      "isUpdate",
      "isPassword",
      roles,
      CAST((SELECT COUNT(*) FROM follower WHERE follower_uuid = '${user_id}') AS INT) AS followerCount,
      CAST((SELECT COUNT(*) FROM follower WHERE following_uuid = '${user_id}') AS INT) AS followingCount,
      CAST((SELECT COUNT(*) FROM forum WHERE user_uuid = '${user_id}') AS INT) AS post_count
      FROM "user"
      WHERE "uuid" = '${user_id}';
      `);
      if (!user) return createBadRequset('Get detail user');
      return createSuccessResponse(user, 'Get detail user');
    } catch (error) {
      console.log('Something went wrong at get detail user: ' + error.message);
      throw error;
    }
  }

  async updateSummary(summary: string, user_uuid: string): Promise<Http> {
    try {
      const user = await this.userRepository.findOne({
        where: { uuid: user_uuid },
      });
      if (!user) return createBadRequset('Update summary');
      //user.summary = summary;
      const response = await this.userRepository.update(
        { uuid: user_uuid },
        { summary: summary }
      );
      if (response.affected === 0) return createBadRequset('Update summary');
      return createSuccessResponse(response, 'Update summary');
    } catch (error) {
      console.log('Something went wrong at update summary: ' + error.message);
      throw error;
    }
  }

  // update profile
  async updateProfile(
    updateProfile: UpdateProfileDTO,
    uuid: string
  ): Promise<Http> {
    try {
      const isExist = await this.userRepository
        .createQueryBuilder('user')
        .where('user.uuid = :uuid', { uuid })
        .getOne();

      if (!isExist) return createBadRequset('Update profile');

      const response = await this.userRepository.update(
        { uuid: uuid },
        { ...updateProfile, isUpdate: true }
      );
      if (!response) return createBadRequset('Update profile');

      return createSuccessResponse(response, 'Update profile');
    } catch (error) {
      console.log('Something went wrong at update profile: ' + error.message);
      throw error;
    }
  }

  //  update avatar
  async updateAvatar(uuid: string, avatar: Express.Multer.File): Promise<Http> {
    try {
      if (!avatar) return createBadRequsetNoMess('avatar is null');
      const isExist = await this.userRepository
        .createQueryBuilder('user')
        .where('user.uuid = :uuid', { uuid })
        .getOne();
      if (!isExist) return createBadRequsetNoMess('Update avatar is fail!!');
      if (isExist.public_id !== null) {
        await this.cloud.deleteFileImage(isExist.public_id);
      }
      const uploaded = await this.cloud.uploadFileAvatar(
        avatar,
        `avatar/${isExist.email}`
      );
      if (!uploaded) return createBadRequset('Update avatar');
      isExist.image_url = uploaded.url;
      isExist.public_id = uploaded.public_id;
      const response = await this.userRepository.save(isExist);
      if (!response) return createBadRequset('Update avatar');
      return createSuccessResponse(response, 'Update avatar');
    } catch (error) {
      console.log('Something went wrong at update avatar: ' + error.message);
    }
  }

  // delete avatar
  async deleteAvatar(uuid: string): Promise<Http> {
    try {
      const isExist = await this.userRepository
        .createQueryBuilder('user')
        .where('user.uuid = :uuid', { uuid })
        .getOne();
      if (!isExist) return createBadRequset('Delete avatar');
      const deleted = await this.cloud.deleteFileImage(isExist.public_id);
      if (!deleted) return createBadRequset('Delete avatar');
      isExist.public_id = null;
      isExist.image_url = null;
      const response = await this.userRepository.save(isExist);
      return createSuccessResponse(response, 'Delete avatar');
    } catch (error) {
      console.log('Something went wrong at delete avatar: ' + error.message);
      throw error;
    }
  }

  // delete user by id
  async deleteUser(user: GetUserDTO): Promise<Http> {
    try {
      const isExits = await this.userRepository
        .findOneBy({
          uuid: user.uuid + '',
        })
        .catch((error) => {});

      if (!isExits) return createBadRequset('Delete user');
      const deleted = await this.userRepository.remove(isExits);
      if (!deleted) return createBadRequset('Delete user');
      return createSuccessResponse(deleted, 'Delete user');
    } catch (error) {
      console.log('Something went wrong at delete user: ' + error.message);
      throw error;
    }
  }

  async findUserByName(name: string): Promise<Http> {
    try {
      const users = await this.userRepository.query(`
      SELECT uuid, fullname, image_url FROM "user" WHERE fullname LIKE '%${name}%'
      `);
      if (!users) return createBadRequset('Find user');
      return createSuccessResponse(users, 'Find user');
    } catch (error) {
      console.log('Something went wrong at find user: ' + error.message);
      throw error;
    }
  }

  async updatePassword(UpdatePassword: UpdatePassword): Promise<Http> {
    const { newPassword, oldPassword, user_uuid } = UpdatePassword;
    if (newPassword === oldPassword) {
      return createBadRequsetNoMess('Old and new passwords must be different');
    }
    const checkUser = await this.userRepository.findOne({
      where: { uuid: user_uuid },
    });
    if (!checkUser) return createBadRequset('Update password');
    const isMatch = await comparePassword(oldPassword, checkUser.password);
    if (!isMatch) return createBadRequsetNoMess('Password is not correct');
    const newpassword = await hashPassword(newPassword);
    const response = await this.userRepository.update(
      { uuid: user_uuid },
      { password: newpassword }
    );
    if (!response) return createBadRequset('Update password');
    return createSuccessResponse(response, 'Update password');
  }

  async getRandomUser(user_uuid: string): Promise<Http> {
    try {
      const users = await this.userRepository.query(`
      SELECT
      u.fullname,
      u.image_url,
      u.email,
      u.uuid,
      FALSE AS is_following
  FROM "user" u
  WHERE NOT EXISTS (
      SELECT 1
      FROM follower f
      WHERE f.following_uuid = '${user_uuid}'
        AND f.follower_uuid = u.uuid
  )
  ORDER BY random()
  LIMIT 21;
      ;
      `);
      if (!users) return createBadRequset('Get random user');
      return createSuccessResponse(users, 'Get random user');
    } catch (error) {
      console.log('Something went wrong at get random user: ' + error.message);
      return createBadRequset('Get random user');
    }
  }
}
