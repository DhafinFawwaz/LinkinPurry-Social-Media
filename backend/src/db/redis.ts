
import { Redis } from 'ioredis'

const redis = new Redis({
	host: (process.env.REDIS_HOST || 'localhost') as string,
	port: (process.env.REDIS_PORT || 6379) as number
});
	redis.on('error', (err) => {
	console.error(err)
});