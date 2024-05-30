from typing import Literal
from litestar.exceptions import *
from pydantic import BaseModel
from ...util import (
    PluginFeatureReference,
)
from ...models import (
    User,
    COLLECTION_ENTITY,
    CollectionEntity,
    EntityRelation,
    FileTemplateReference,
)


class EntityCreationModel(BaseModel):
    type: Literal["file", "folder", "image"]
    parent: str | None = None
    name: str
    summary: str
    tags: list[str]
    url: str | None = None  # Only relevant for `image`
    template: FileTemplateReference | None = None  # Only relevant for `file`
    color: str | None = None  # Only relevant for `folder`
    icon: str | None = None  # Only relevant for `folder`


class ReducedEntity(BaseModel):
    id: str
    type: Literal["file", "folder", "image"]
    name: str
    summary: str
    tags: list[str]
    url: str | None = None  # Only relevant for `image`
    template: FileTemplateReference | None = None  # Only relevant for `file`
    color: str | None = None  # Only relevant for `folder`
    icon: str | None = None  # Only relevant for `folder`

    @classmethod
    def from_entity(cls, entity: COLLECTION_ENTITY) -> "ReducedEntity":
        return ReducedEntity(**entity.model_dump())


async def provide_entity(user: User, id: str) -> COLLECTION_ENTITY:
    links = await user.get_links(
        target=CollectionEntity,
        relation=EntityRelation.LINK,
        query={"data.type": "access"},
    )
    if not id in [l.target_id for l in links]:
        raise NotFoundException("error.api.collection.unknown_entity")
    return await CollectionEntity.get(id)
