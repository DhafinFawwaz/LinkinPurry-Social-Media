
import { Redis } from 'ioredis'

export const redis = new Redis({
	host: (process.env.REDIS_HOST || 'localhost') as string,
	port: (process.env.REDIS_PORT || 6379) as number
});
	redis.on('error', (err) => {
	console.log("host: " + (process.env.REDIS_HOST || 'localhost'))
	console.log("post: " + ((process.env.REDIS_PORT || 6379) as number))
	console.error(err)
});