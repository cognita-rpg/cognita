from .config import Config
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from beanie import init_beanie


class Context:
    def __init__(self):
        self.config = Config.load()

        mongo_config = self.config.storage.mongo
        redis_config = self.config.storage.redis
        self.mongo_client = AsyncIOMotorClient(
            host=mongo_config.host,
            port=mongo_config.port,
            username=mongo_config.username,
            password=mongo_config.password,
        )
        self.mongo_database = self.mongo_client.get_database(name=mongo_config.database)
        self.redis_client = Redis(
            host=redis_config.host,
            port=redis_config.port,
            username=redis_config.username,
            password=redis_config.password,
            db=redis_config.database,
        )

    async def initialize(self):
        await init_beanie(database=self.mongo_database, document_models=[])
