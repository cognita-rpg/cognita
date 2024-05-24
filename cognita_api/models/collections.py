from typing import Any, Literal, Type, TypeVar
from .base import BaseObject
from .links import EntityLink, EntityRelation, EntityType
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

    async def get_path(self) -> list["COLLECTION_ENTITY"]:
        results = [self]
        current_id = self.id
        while True:
            parent = await EntityLink.find_one(
                {
                    "source_type": EntityType.ENTITY,
                    "source_id": current_id,
                    "target_type": EntityType.ENTITY,
                    "relation": EntityRelation.CHILD,
                }
            )
            if parent:
                results.insert(0, await CollectionEntity.get(parent.target_id))
                current_id = parent.target_id
            else:
                return results

    @classmethod
    def get_factory(
        cls, type: Literal["folder", "image", "file"]
    ) -> "FolderEntity | ImageEntity | FileEntity":
        match type:
            case "file":
                return FileEntity
            case "folder":
                return FolderEntity
            case "image":
                return ImageEntity


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
