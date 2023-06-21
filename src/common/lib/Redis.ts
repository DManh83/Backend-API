import { promisify } from 'util';
import redis from 'redis';
import config from '../../../config/env';

const client = redis.createClient(config.redisUrl as any);

const hincrby = promisify(client.hincrby).bind(client);
const hget = promisify(client.hget).bind(client);
const hgetAll = promisify(client.hgetall).bind(client);
const hset = promisify(client.hset).bind(client);
const hdel = promisify(client.hdel).bind(client);
const del = promisify(client.del).bind(client);

export default class Redis {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  async getField(field: string, defaultValue = null) {
    return (await hget(this.key, field)) || defaultValue;
  }

  async getAll() {
    return hgetAll(this.key);
  }

  async set(object: any[]) {
    return hset([this.key, ...object]);
  }

  async delete(field: string) {
    // @ts-ignore
    return hdel(this.key, field);
  }

  async deleteAll() {
    // @ts-ignore
    return del(this.key);
  }

  async decrement(field: string) {
    return hincrby(this.key, field, -1);
  }

  async increment(field: string) {
    return hincrby(this.key, field, 1);
  }
}
