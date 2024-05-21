from typing import Any, ClassVar, Type, TypeVar
from enum import StrEnum

from pydantic import Field
from .base import BaseObject
from .auth import User, Session
from ..util.plugin import Plugin


class EntityType(StrEnum):
    USER = "user"
    GROUP = "group"
    FOLDER = "folder"
    ENTITY = "entity"
    SESSION = "session"
    SCENE = "scene"
    PLUGIN = "plugin"


class EntityRelation(StrEnum):
    PARENT = "parent"  # If SOURCE is the parent of TARGET
    CHILD = "child"  # If SOURCE is the child of TARGET
    LINK = "link"  # If SOURCE and TARGET are linked non-hierarchically


TEntity = TypeVar("TEntity")
TEntityOther = TypeVar("TEntityOther")


class EntityLink(BaseObject):
    context: ClassVar[Any] = None
    source_type: EntityType
    source_id: str
    target_type: EntityType
    target_id: str
    relation: EntityRelation
    data: Any | None = None

    class Settings:
        name = "entity_link"

    @classmethod
    def _initialize(cls: Type["EntityLink"], context: Any) -> None:
        cls.context = context

    @classmethod
    async def get_links(
        cls: Type["EntityLink"],
        source_id: str,
        source_type: EntityType | None = None,
        relation_type: EntityRelation | None = None,
        target_id: str | None = None,
        target_type: EntityType | None = None,
        data_query: Any | None = None,
    ) -> list["EntityLink"]:
        query = {"source_id": source_id}

        if source_type:
            query["source_type"] = source_type
        if relation_type:
            query["relation"] = relation_type
        if target_id:
            query["target_id"] = target_id
        if target_type:
            query["target_type"] = target_type
        if data_query:
            query["data"] = data_query

        return await EntityLink.find(query).to_list()

    async def source[TEntity](self) -> TEntity | None:
        entity_type = self.source_type
        entity_id = self.source_id
        match entity_type:
            case EntityType.SESSION:
                return await Session.get(entity_id)
            case EntityType.USER:
                return await User.get(entity_id)
            case EntityType.PLUGIN:
                return self.context.plugins.get(entity_id)
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
            case EntityType.PLUGIN:
                return self.context.plugins.get(entity_id)
            case _:
                raise NotImplementedError

    @classmethod
    def create_link(
        cls: Type["EntityLink"],
        source: TEntity,
        target: TEntityOther,
        type: EntityRelation = EntityRelation.LINK,
        data: Any | None = None,
    ) -> "EntityLink":
        source_id = source.metadata.slug if isinstance(source, Plugin) else source.id
        target_id = target.metadata.slug if isinstance(target, Plugin) else target.id

        if isinstance(source, Session):
            source_type = EntityType.SESSION
        elif isinstance(source, User):
            source_type = EntityType.USER
        elif isinstance(source, Plugin):
            source_type = EntityType.PLUGIN
        else:
            raise NotImplementedError

        if isinstance(target, Session):
            target_type = EntityType.SESSION
        elif isinstance(target, User):
            target_type = EntityType.USER
        elif isinstance(target, Plugin):
            target_type = EntityType.PLUGIN
        else:
            raise NotImplementedError

        return EntityLink(
            source_id=source_id,
            source_type=source_type,
            target_id=target_id,
            target_type=target_type,
            relation=type,
            data=data,
        )
