from inspect import isclass
from secrets import token_urlsafe
from typing import Any, ClassVar, Type, TypeVar
from enum import StrEnum

from beanie import Document
from pydantic import Field


class EntityType(StrEnum):
    USER = "user"
    GROUP = "group"
    ENTITY = "entity"
    SESSION = "session"
    SCENE = "scene"
    PLUGIN = "plugin"

    @classmethod
    def from_type(cls: "EntityType", entity: Any) -> "EntityType | None":
        if hasattr(entity, "__name__"):
            name = entity.__name__
        else:
            name = entity.__class__.__name__

        match name:
            case "User":
                return EntityType.USER
            case "Group":
                return EntityType.GROUP
            case "Session":
                return EntityType.SESSION
            case "Scene":
                return EntityType.SCENE
            case "Plugin":
                return EntityType.PLUGIN
            case "CollectionEntity":
                return EntityType.ENTITY
            case "FolderEntity":
                return EntityType.ENTITY
            case "FileEntity":
                return EntityType.ENTITY
            case "ImageEntity":
                return EntityType.ENTITY
            case _:
                return None


class EntityRelation(StrEnum):
    PARENT = "parent"  # If SOURCE is the parent of TARGET
    CHILD = "child"  # If SOURCE is the child of TARGET
    LINK = "link"  # If SOURCE and TARGET are linked non-hierarchically


TEntity = TypeVar("TEntity")
TEntityOther = TypeVar("TEntityOther")


class EntityLink(Document):
    id: str = Field(default_factory=lambda: token_urlsafe())
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
        source: Any,
        target: Any | None = None,
        relation_type: EntityRelation = EntityRelation.LINK,
        query: dict[str, Any] | None = None,
    ) -> list["EntityLink"]:
        source_type = EntityType.from_type(source)
        if source_type == None:
            raise ValueError("Unknown source type")

        if not isclass(source):
            if source_type == EntityType.PLUGIN:
                source_id = source.metadata.slug
            else:
                source_id = source.id
        else:
            source_id = None

        if target:
            target_type = EntityType.from_type(target)
            if target_type == None:
                raise ValueError("Unknown target type")
            if not isclass(target):
                if target_type == EntityType.PLUGIN:
                    target_id = target.metadata.slug
                else:
                    target_id = target.id
            else:
                target_id = None
        else:
            target_id = None
            target_type = None

        query = {"source_id": source_id}

        if source_type:
            query["source_type"] = source_type
        if relation_type:
            query["relation"] = relation_type
        if target_id:
            query["target_id"] = target_id
        if target_type:
            query["target_type"] = target_type
        if query:
            for key, value in query.items():
                query[key] = value

        return await EntityLink.find(query).to_list()

    @classmethod
    def create_link(
        cls: Type["EntityLink"],
        source: Any,
        target: Any,
        relation: EntityRelation = EntityRelation.LINK,
        data: Any = None,
    ) -> "EntityLink":
        if isclass(source) or isclass(target):
            raise ValueError("Source/target must be initialized")
        source_type = EntityType.from_type(source)
        if source_type == None:
            raise ValueError("Unknown source type")
        if source_type == EntityType.PLUGIN:
            source_id = source.metadata.slug
        else:
            source_id = source.id

        target_type = EntityType.from_type(target)
        if target_type == None:
            raise ValueError("Unknown target type")
        if target_type == EntityType.PLUGIN:
            target_id = target.metadata.slug
        else:
            target_id = target.id

        return EntityLink(
            source_id=source_id,
            source_type=source_type,
            target_id=target_id,
            target_type=target_type,
            relation=relation,
            data=data,
        )
