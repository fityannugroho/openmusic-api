const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.server,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  set(key, value, expirationInSecond = 1800) {
    return this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const value = await this._client.get(key);

    if (!value) {
      throw new Error('Cache not found');
    }

    return value;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
