from typing import Type
from .config import Config
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from beanie import init_beanie
from ..models import *
from .plugin import PluginLoader, Plugin


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
        self.plugins = PluginLoader(self.config)

    async def initialize(self):
        EntityLink._initialize(self)
        await init_beanie(
            database=self.mongo_database,
            document_models=[
                Session,
                User,
                EntityLink,
                ImageEntity,
                FolderEntity,
                FileEntity,
                CollectionEntity,
            ],
        )

    def get_object(self, type: EntityType) -> Type[BaseObject]:
        match type:
            case EntityType.USER:
                return User
            case EntityType.SESSION:
                return Session
            case EntityType.ENTITY:
                return CollectionEntity
            case _:
                raise NotImplementedError

    async def bulk_query_ids(
        self, targets: dict[str, EntityType]
    ) -> dict[str, BaseObject | Plugin]:
        plugin_ids = [
            key for key, value in targets.items() if value == EntityType.PLUGIN
        ]
        collection_map = {}
        factory_map = {}
        for key, value in targets.items():
            if value != EntityType.PLUGIN:
                factory = self.get_object(value)
                collection = factory.get_collection_name()
                if collection and factory:
                    factory_map[key] = factory
                    if not collection in collection_map.keys():
                        collection_map[collection] = []

                    collection_map[collection].append(key)

        result_map = {}
        for collection, ids in collection_map.items():
            raw_results = (
                await self.mongo_database.get_collection(collection)
                .find({"_id": {"$in": ids}})
                .to_list(None)
            )
            for result in raw_results:
                if result["_id"] in factory_map.keys():
                    factory = factory_map[result["_id"]]
                    if hasattr(factory, "get_factory") and "type" in result.keys():
                        result_map[result["_id"]] = factory.get_factory(result["type"])(
                            **result
                        )
                    else:
                        result_map[result["_id"]] = factory(**result)

        for plugin in plugin_ids:
            res = self.plugins.get(plugin)
            if res:
                result_map[plugin] = res

        return result_map

    async def get_connections(
        self, root: BaseObject, *include: EntityType
    ) -> dict[str, BaseObject | Plugin]:
        result_ids = {}
        result_ids[root.id] = EntityType.from_type(root)

        current = [root.id]
        while True:
            new_current = []
            for c in current:
                if len(include) > 0:
                    root_source = await EntityLink.find(
                        {"source_id": c, "target_type": {"$in": include}}
                    ).to_list()
                    root_target = await EntityLink.find(
                        {"target_id": c, "source_type": {"$in": include}}
                    ).to_list()
                else:
                    root_source = await EntityLink.find({"source_id": c}).to_list()
                    root_target = await EntityLink.find({"target_id": c}).to_list()

                for i in root_source:
                    if (
                        not i.target_id in current
                        and not i.target_id in result_ids.keys()
                        and not i.target_id in new_current
                    ):
                        new_current.append(i.target_id)
                        result_ids[i.target_id] = i.target_type

                for i in root_target:
                    if (
                        not i.source_id in current
                        and not i.source_id in result_ids.keys()
                        and not i.source_id in new_current
                    ):
                        new_current.append(i.source_id)
                        result_ids[i.source_id] = i.source_type

            current = new_current[:]
            if len(current) == 0:
                break

        return await self.bulk_query_ids(result_ids)
