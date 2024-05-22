from secrets import token_urlsafe
from typing import Any
from beanie import Document
from pydantic import Field
from .links import EntityLink, EntityRelation


class BaseObject(Document):
    id: str = Field(default_factory=lambda: token_urlsafe(nbytes=16))

    async def link_to(
        self,
        target: Any,
        relation: EntityRelation = EntityRelation.LINK,
        data: Any = None,
    ) -> EntityLink:
        new_link = EntityLink.create_link(self, target, relation=relation, data=data)
        await new_link.save()
        return new_link

    async def get_links(
        self,
        target: Any | None = None,
        relation: EntityRelation | None = None,
        data: Any | None = None,
    ) -> list[EntityLink]:
        return await EntityLink.get_links(
            self, target=target, relation_type=relation, data_query=data
        )
