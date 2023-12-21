import { fakerVI } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createSuccessResponse,
  panigationData,
} from 'src/common';
import { Topic } from 'src/entities';
import { OptionDelete } from 'src/utils';
import { In, Repository } from 'typeorm';
import { CloudService } from '../cloud';
import { CreateTopicDTO, UpdateTopicDTO } from './dto';
import { faker } from '@faker-js/faker/locale/el';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly cloduService: CloudService
  ) {}

  // get all topic
  async getAllTopic(): Promise<Topic[]> {
    try {
      const response = await this.topicRepository.find();
      if (!response) return undefined;
      return response;
    } catch (error) {
      console.log('Something went wrong at get all topic: ' + error.message);
    }
  }

  async getAllTopicV1(page: number = 1) {
    try {
      const topics = await this.topicRepository.query(`
      SELECT uuid, name, description, image_url, public_id, created_at, updated_at,
      (SELECT COUNT(*) FROM comic_topic WHERE topic_uuid = t.uuid) AS comic_count
      FROM "topic" t
      LIMIT 10 OFFSET ((${page} - 1) * 10);
      `);
      const total = await this.topicRepository.query(`
      SELECT COUNT(*) FROM "topic"`);

      const topicsWithoutComicCount = topics.map(
        ({ comic_count, ...rest }) => rest
      );

      const data = panigationData(
        page,
        topicsWithoutComicCount,
        Number(total[0]['count'])
      );

      console.log(data);
      if (!data) return null;
      return data;
    } catch (error) {
      console.log('Something went wrong at get all topic: ' + error.message);
    }
  }

  async getTopicById(uuid: string): Promise<any> {
    try {
      const topic = await this.topicRepository.findOne({
        where: { uuid: uuid },
      });
      if (!topic) return null;
      return topic;
    } catch (error) {
      console.log('Something went wrong at get topic by id: ' + error.message);
    }
  }

  // get topic by id
  async getAllTopicsByName(name: string[]): Promise<Topic[]> {
    try {
      const topics = await this.topicRepository.find({
        where: { name: In(name) },
      });

      if (!topics) return null;

      return topics;
    } catch (error) {
      console.log('Something went wrong at get topic by ids: ' + error.message);
    }
  }

  async getAllTopicsByUuid(uuid: string[]): Promise<Topic[]> {
    try {
      const topics = await this.topicRepository.find({
        where: { uuid: In(uuid) },
      });

      if (!topics) return null;

      return topics;
    } catch (error) {
      console.log('Something went wrong at get topic by ids: ' + error.message);
      throw error;
    }
  }

  // create topic
  async createTopic(
    topic: CreateTopicDTO,
    image: Express.Multer.File
  ): Promise<Http> {
    try {
      const isExit = await this.topicRepository.findOne({
        where: { name: topic.name },
      });
      if (isExit) return createBadRequsetNoMess('Topic is exit!!');
      const image_url = await this.cloduService.uploadFileAvatar(
        image,
        topic.name
      );

      const newTopic = new Topic({
        name: topic.name,
        public_id: image_url.public_id,
        image_url: image_url.url,
        description: topic.description,
      });

      const response = await this.topicRepository.save(newTopic);
      if (!response) return createBadRequset('Create topic is fail!!');

      return createSuccessResponse(response, 'Create topic');
    } catch (error) {
      console.log('Something went wrong at create topic: ' + error.message);
    }
  }

  // update topic by id
  async updateTopicById(updateTopicDTO: UpdateTopicDTO): Promise<Http> {
    try {
      const response = await this.topicRepository
        .update({ uuid: updateTopicDTO.uuid }, updateTopicDTO)
        .catch((err) => {});
      if (!response) return createBadRequset('Update topic is fail!!');

      return createSuccessResponse(response, 'Update topic');
    } catch (error) {
      console.log('Something went wrong at update topic: ' + error.message);
    }
  }

  // delete topic by id
  async deleteTopicById(uuids: string[], option: OptionDelete): Promise<Http> {
    try {
      switch (option) {
        case OptionDelete.ALL:
          const topics = await this.topicRepository.find();
          const responseDeleteCaseAll = await this.topicRepository.remove(
            topics
          );
          if (!responseDeleteCaseAll)
            return createBadRequset('Delete topic is fail!!');
          return createSuccessResponse(responseDeleteCaseAll, 'Delete topic');
        case OptionDelete.UUIDS:
          const topics1 = await this.topicRepository.find({
            where: { uuid: In(uuids) },
          });
          console.log(topics1);
          const responseDeleteCaseOption = await this.topicRepository.remove(
            topics1
          );
          if (
            !responseDeleteCaseOption ||
            responseDeleteCaseOption.length === 0
          )
            return createBadRequsetNoMess('Delete topic is fail!!');
          return createSuccessResponse(
            responseDeleteCaseOption,
            'Delete topic'
          );
        default:
          return createBadRequset('Option is not exits!!');
      }
    } catch (error) {
      console.log('Something went wrong at delete topic: ' + error.message);
    }
  }

  // delete topic by id v1
  async deleteTopicByIdV1(uuid: string): Promise<Http> {
    try {
      const topic = await this.topicRepository.findOne({
        where: { uuid: uuid },
      });
      const responseDeleteCaseOption = await this.topicRepository.remove(topic);
      if (!responseDeleteCaseOption)
        return createBadRequsetNoMess('Delete topic is fail!!');
      return createSuccessResponse(responseDeleteCaseOption, 'Delete topic');
    } catch (error) {
      console.log('Something went wrong at delete topic: ' + error.message);
    }
  }

  async createDummyTopic(): Promise<Http> {
    try {
      const topics = [];
      for (let i = 0; i < 10; i++) {
        const topic = new Topic({
          name: faker.internet.userName(),
          image_url: fakerVI.image.urlLoremFlickr({ category: 'cats' }),
          description: fakerVI.lorem.paragraph(),
        });
        topics.push(topic);
        this.topicRepository.create(topic);
      }
      const response = await this.topicRepository.save(topics);

      if (!response) return createBadRequset('Create topic is fail!!');
      return createSuccessResponse(
        `${response.length} was created`,
        'Create topic'
      );
    } catch (error) {
      createBadRequsetNoMess(
        'Something went wrong at create dummy topic: ' + error.message
      );
    }
  }
}
