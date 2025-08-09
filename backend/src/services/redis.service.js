const Redis = require('ioredis');
const { promisify } = require('util');

class RedisService {
  constructor() {
    this.client = null;
    this.publisher = null;
    this.subscriber = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connections
   */
  async initialize() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    };

    try {
      // Main client for general operations
      this.client = new Redis(redisConfig);
      
      // Publisher for pub/sub
      this.publisher = new Redis(redisConfig);
      
      // Subscriber for pub/sub
      this.subscriber = new Redis(redisConfig);

      // Setup error handlers
      this.client.on('error', (err) => console.error('Redis Client Error:', err));
      this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
      this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

      // Wait for connections
      await Promise.all([
        this.client.ping(),
        this.publisher.ping(),
        this.subscriber.ping()
      ]);

      this.isConnected = true;
      console.log('✅ Redis service initialized');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  /**
   * Cache operations
   */
  
  // Set with expiration
  async set(key, value, expirationInSeconds = 3600) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
    if (expirationInSeconds) {
      return await this.client.setex(key, expirationInSeconds, serialized);
    }
    return await this.client.set(key, serialized);
  }

  // Get value
  async get(key) {
    const value = await this.client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // Delete key
  async del(key) {
    return await this.client.del(key);
  }

  // Check if key exists
  async exists(key) {
    return await this.client.exists(key);
  }

  // Set multiple keys
  async mset(keyValuePairs) {
    const flattenedPairs = [];
    for (const [key, value] of Object.entries(keyValuePairs)) {
      flattenedPairs.push(key, JSON.stringify(value));
    }
    return await this.client.mset(...flattenedPairs);
  }

  // Get multiple keys
  async mget(keys) {
    const values = await this.client.mget(keys);
    return values.map(value => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  }

  /**
   * Hash operations
   */
  
  async hset(key, field, value) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
    return await this.client.hset(key, field, serialized);
  }

  async hget(key, field) {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async hgetall(key) {
    const hash = await this.client.hgetall(key);
    const result = {};
    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value;
      }
    }
    return result;
  }

  async hdel(key, field) {
    return await this.client.hdel(key, field);
  }

  /**
   * List operations
   */
  
  async lpush(key, value) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
    return await this.client.lpush(key, serialized);
  }

  async rpush(key, value) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
    return await this.client.rpush(key, serialized);
  }

  async lrange(key, start, stop) {
    const values = await this.client.lrange(key, start, stop);
    return values.map(value => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  }

  async llen(key) {
    return await this.client.llen(key);
  }

  async ltrim(key, start, stop) {
    return await this.client.ltrim(key, start, stop);
  }

  /**
   * Set operations
   */
  
  async sadd(key, member) {
    return await this.client.sadd(key, member);
  }

  async srem(key, member) {
    return await this.client.srem(key, member);
  }

  async smembers(key) {
    return await this.client.smembers(key);
  }

  async sismember(key, member) {
    return await this.client.sismember(key, member);
  }

  /**
   * Sorted set operations
   */
  
  async zadd(key, score, member) {
    return await this.client.zadd(key, score, member);
  }

  async zrange(key, start, stop, withScores = false) {
    if (withScores) {
      return await this.client.zrange(key, start, stop, 'WITHSCORES');
    }
    return await this.client.zrange(key, start, stop);
  }

  async zrem(key, member) {
    return await this.client.zrem(key, member);
  }

  async zrank(key, member) {
    return await this.client.zrank(key, member);
  }

  /**
   * Pub/Sub operations
   */
  
  async publish(channel, message) {
    const serialized = typeof message === 'object' ? JSON.stringify(message) : message;
    return await this.publisher.publish(channel, serialized);
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel);
    
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch {
          callback(message);
        }
      }
    });
  }

  async unsubscribe(channel) {
    return await this.subscriber.unsubscribe(channel);
  }

  /**
   * Advanced caching patterns
   */
  
  // Cache with automatic refresh
  async getOrSet(key, fetchFunction, expirationInSeconds = 3600) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFunction();
    await this.set(key, value, expirationInSeconds);
    return value;
  }

  // Invalidate cache pattern
  async invalidatePattern(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      return await this.client.del(...keys);
    }
    return 0;
  }

  // Distributed lock
  async acquireLock(lockKey, ttl = 10000) {
    const identifier = Date.now().toString();
    const result = await this.client.set(
      lockKey,
      identifier,
      'PX',
      ttl,
      'NX'
    );
    return result === 'OK' ? identifier : null;
  }

  async releaseLock(lockKey, identifier) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await this.client.eval(script, 1, lockKey, identifier);
  }

  /**
   * Rate limiting
   */
  async checkRateLimit(key, limit, window) {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, window);
    }
    return current <= limit;
  }

  /**
   * Session management
   */
  async setSession(sessionId, data, ttl = 86400) {
    return await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  async extendSession(sessionId, ttl = 86400) {
    return await this.client.expire(`session:${sessionId}`, ttl);
  }

  /**
   * Cleanup and monitoring
   */
  
  async flushAll() {
    return await this.client.flushall();
  }

  async getInfo() {
    return await this.client.info();
  }

  async getMemoryUsage() {
    const info = await this.client.info('memory');
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : 'Unknown';
  }

  /**
   * Close connections
   */
  async close() {
    if (this.client) await this.client.quit();
    if (this.publisher) await this.publisher.quit();
    if (this.subscriber) await this.subscriber.quit();
    this.isConnected = false;
    console.log('Redis connections closed');
  }
}

module.exports = new RedisService();