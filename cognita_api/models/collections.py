from typing import Any, Literal, Type, TypeVar
from .base import BaseObject
from ..util.plugin import PluginFeatureReference

TBase = TypeVar("TBase", bound="CollectionEntity")


class CollectionEntity(BaseObject):
    type: None = None
    name: str
    summary: str | None = None
    tags: list[str] = []

    class Settings:
        name = "entities"
        is_root = True

    @classmethod
    async def get(cls: Type[TBase], id: str) -> TBase | None:
        return await super().get(id, with_children=True)


class FolderEntity(CollectionEntity):
    type: Literal["folder"] = "folder"
    color: str | None = None
    icon: str | None = None


class ImageEntity(CollectionEntity):
    type: Literal["image"] = "image"
    url: str


class FileEntity(CollectionEntity):
    type: Literal["file"] = "file"
    template: PluginFeatureReference
    content: Any | None = None

COLLECTION_ENTITY = FolderEntity | ImageEntity | FileEntity
