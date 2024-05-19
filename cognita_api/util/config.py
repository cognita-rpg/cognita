from pydantic import BaseModel
from yaml import load

try:
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader


class StorageItem(BaseModel):
    host: str
    port: int
    username: str | None = None
    password: str | None = None


class RedisStorage(StorageItem):
    database: int = 0


class MongoStorage(StorageItem):
    database: str = "cognita"


class StorageConfig(BaseModel):
    mongo: MongoStorage
    redis: RedisStorage


class Config(BaseModel):
    storage: StorageConfig

    @classmethod
    def load(cls) -> "Config":
        with open("config.yaml", "r") as conf:
            data = load(conf.read(), Loader=Loader)
            return Config(**data)
