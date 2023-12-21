import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisManagerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async refreshCacheComics() {
    const keysCache = await this.redis.keys('*getallcomic*');
    if (keysCache.length > 0) {
      await this.redis.del(keysCache);
    }
  }

  async refreshCacheChapter() {
    const keysCache = await this.redis.keys('*chapter*');
    if (keysCache.length > 0) {
      await this.redis.del(keysCache);
    }
  }
}
