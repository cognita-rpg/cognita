from typing import Literal, Optional
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from pydantic import BaseModel
from beanie.operators import In
from ...util import provide_user, guard_user, PluginFeatureReference, Plugin, Context
from ...models import (
    User,
    COLLECTION_ENTITY,
    CollectionEntity,
    FileEntity,
    FolderEntity,
    ImageEntity,
    EntityRelation,
    EntityLink,
    EntityType,
)


class EntityCreationModel(BaseModel):
    type: Literal["file", "folder", "image"]
    parent: str | None = None
    name: str
    summary: str
    tags: list[str]
    url: str | None = None  # Only relevant for `image`
    template: PluginFeatureReference | None = None  # Only relevant for `file`
    color: str | None = None  # Only relevant for `folder`
    icon: str | None = None  # Only relevant for `folder`


class ReducedEntity(BaseModel):
    type: Literal["file", "folder", "image"]
    name: str
    summary: str
    tags: list[str]
    url: str | None = None  # Only relevant for `image`
    template: PluginFeatureReference | None = None  # Only relevant for `file`
    color: str | None = None  # Only relevant for `folder`
    icon: str | None = None  # Only relevant for `folder`

    @classmethod
    def from_entity(cls, entity: COLLECTION_ENTITY) -> "ReducedEntity":
        return ReducedEntity(**entity.model_dump())


class CollectionsController(Controller):
    path = "/collections"
    guards = [guard_user]
    dependencies = {"user": Provide(provide_user)}

    @post("/new")
    async def create_collection_entity(
        self, user: User, data: EntityCreationModel
    ) -> COLLECTION_ENTITY:
        if data.parent:
            parent = await CollectionEntity.get(data.parent)
            if not parent:
                raise NotFoundException("error.api.collection.unknown_parent")
        else:
            parent = None

        match data.type:
            case "file":
                if not data.template:
                    raise ValidationException("error.api.collection.new.missing_field")
                entity = FileEntity(
                    name=data.name,
                    summary=data.summary,
                    tags=data.tags,
                    template=data.template,
                )
            case "folder":
                entity = FolderEntity(
                    name=data.name,
                    summary=data.summary,
                    tags=data.tags,
                    color=data.color,
                    icon=data.icon,
                )
            case "image":
                if not data.url:
                    raise ValidationException("error.api.collection.new.missing_field")
                entity = ImageEntity(
                    name=data.name, summary=data.summary, tags=data.tags, url=data.url
                )

        if parent:
            await entity.link_to(parent, relation=EntityRelation.CHILD)

        await user.link_to(
            entity,
            relation=EntityRelation.LINK,
            data={"type": "access", "permission": "owner"},
        )

        await entity.save()
        return entity

    @get("/file_templates")
    async def get_file_templates(
        self, user: User, context: Context
    ) -> list[PluginFeatureReference]:
        enabled_plugins = [
            context.plugins.get(i.target_id)
            for i in await user.get_links(
                target=Plugin,
                relation=EntityRelation.LINK,
                query={"data.type": "enabled"},
            )
        ]
        features = []
        for plugin in enabled_plugins:
            for feature in plugin.manifest.features:
                if feature.type == "article-template":
                    features.append(
                        PluginFeatureReference.from_feature(
                            plugin.manifest, feature.name
                        )
                    )

        return features

    @get("/")
    async def get_entities(
        self, user: User, parent: Optional[str] = None
    ) -> list[ReducedEntity]:
        if parent:
            parent_obj = await CollectionEntity.get(parent)
            if not parent_obj:
                raise NotFoundException("error.api.collection.unknown_parent")
        else:
            parent_obj = None

        all_accessible = await user.get_links(
            target=CollectionEntity,
            relation=EntityRelation.LINK,
            query={"data.type": "access"},
        )

        if parent_obj:
            constrained = [
                i.source_id
                for i in await EntityLink.find(
                    {
                        "source_type": EntityType.ENTITY,
                        "source_id": {"$in": [i.target_id for i in all_accessible]},
                        "target_type": EntityType.ENTITY,
                        "target_id": parent_obj.id,
                        "relation": EntityRelation.CHILD,
                    }
                ).to_list()
            ]
        else:
            has_parent = await EntityLink.find(
                {
                    "source_type": EntityType.ENTITY,
                    "target_type": EntityType.ENTITY,
                    "source_id": {"$in": [i.target_id for i in all_accessible]},
                    "relation": EntityRelation.CHILD,
                }
            ).to_list()
            has_parent_ids = [i.source_id for i in has_parent]
            constrained = [
                i.target_id for i in all_accessible if not i.target_id in has_parent_ids
            ]

        return [
            ReducedEntity.from_entity(i)
            for i in await CollectionEntity.find(
                In(CollectionEntity.id, constrained), with_children=True
            ).to_list()
        ]
