from secrets import token_urlsafe
from typing import Any
from beanie import Document, before_event, Delete
from beanie.operators import Or
from pydantic import Field
from .links import EntityLink, EntityRelation, EntityType


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
        query: dict[str, Any] | None = None,
    ) -> list[EntityLink]:
        return await EntityLink.get_links(
            self, target=target, relation_type=relation, query=query
        )

    @before_event(Delete)
    async def clear_links(self):
        await EntityLink.find(
            Or(EntityLink.source_id == self.id, EntityLink.target_id == self.id)
        ).delete()
