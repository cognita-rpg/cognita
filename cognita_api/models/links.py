from typing import Any, Type, TypeVar
from enum import StrEnum
from .base import BaseObject
from .auth import User, Session


class EntityType(StrEnum):
    USER = "user"
    GROUP = "group"
    FOLDER = "folder"
    ENTITY = "entity"
    SESSION = "session"
    SCENE = "scene"


class EntityRelation(StrEnum):
    PARENT = "parent"  # If SOURCE is the parent of TARGET
    CHILD = "child"  # If SOURCE is the child of TARGET
    LINK = "link"  # If SOURCE and TARGET are linked non-hierarchically


TData = TypeVar("TData")
TEntity = TypeVar("TEntity", bound=BaseObject)
TEntityOther = TypeVar("TEntityOther", bound=BaseObject)


class EntityLink[TData](BaseObject):
    source_type: EntityType
    source_id: str
    target_type: EntityType
    target_id: str
    relation: EntityRelation
    data: TData | None = None

    class Settings:
        name = "entity_link"

    @classmethod
    async def get_links(
        cls: Type["EntityLink[TData]"],
        source_id: str,
        source_type: EntityType | None = None,
        relation_type: EntityRelation | None = None,
        target_id: str | None = None,
        target_type: EntityType | None = None,
    ) -> list["EntityLink[TData]"]:
        query = {"source_id": source_id}

        if source_type:
            query["source_type"] = source_type
        if relation_type:
            query["relation"] = relation_type
        if target_id:
            query["target_id"] = target_id
        if target_type:
            query["target_type"] = target_type

        return await EntityLink[TData].find(query).to_list()

    async def source[TEntity](self) -> TEntity | None:
        entity_type = self.source_type
        entity_id = self.source_id
        match entity_type:
            case EntityType.SESSION:
                return await Session.get(entity_id)
            case EntityType.USER:
                return await User.get(entity_id)
            case _:
                raise NotImplementedError

    async def target[TEntity](self) -> TEntity | None:
        entity_type = self.target_type
        entity_id = self.target_id
        match entity_type:
            case EntityType.SESSION:
                return await Session.get(entity_id)
            case EntityType.USER:
                return await User.get(entity_id)
            case _:
                raise NotImplementedError

    @classmethod
    def create_link[
        TData
    ](
        cls: Type["EntityLink[TData]"],
        source: TEntity,
        target: TEntityOther,
        type: EntityRelation = EntityRelation.LINK,
        data: TData | None = None,
    ) -> "EntityLink[TData]":
        source_id = source.id
        target_id = target.id

        if isinstance(source, Session):
            source_type = EntityType.SESSION
        elif isinstance(source, User):
            source_type = EntityType.USER
        else:
            raise NotImplementedError

        if isinstance(target, Session):
            target_type = EntityType.SESSION
        elif isinstance(target, User):
            target_type = EntityType.USER
        else:
            raise NotImplementedError

        return EntityLink[TData](
            source_id=source_id,
            source_type=source_type,
            target_id=target_id,
            target_type=target_type,
            relation=type,
            data=data,
        )
