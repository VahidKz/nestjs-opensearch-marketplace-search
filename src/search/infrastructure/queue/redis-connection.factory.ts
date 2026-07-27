import { RedisOptions } from 'ioredis';

export function redisConnectionFromUrl(redisUrl: string): RedisOptions {
  const parsedUrl = new URL(redisUrl);
  const database = parsedUrl.pathname.replace('/', '');

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
    username: parsedUrl.username || undefined,
    password: parsedUrl.password || undefined,
    db: database ? Number(database) : 0,
    tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
