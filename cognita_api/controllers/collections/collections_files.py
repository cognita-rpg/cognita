from litestar import Controller, get, post
from litestar.di import Provide
from pydantic import BaseModel
from ...util import (
    guard_user,
    provide_user,
    Context,
    Plugin,
    FEATURE_TYPES,
    EXPORT_TYPES,
    PluginManifest_Metadata,
)
from ...models import User, EntityRelation, FileEntity


class StandaloneFeature(BaseModel):
    plugin_info: PluginManifest_Metadata
    exports: dict[str, EXPORT_TYPES]
    feature: FEATURE_TYPES

    @classmethod
    def create(cls, plugin: Plugin, feature: FEATURE_TYPES) -> "StandaloneFeature":
        return StandaloneFeature(
            plugin_info=plugin.metadata,
            exports={
                i: plugin.manifest.exports.get(i)
                for i in feature.required_exports
                if plugin.manifest.exports.get(i)
            },
            feature=feature,
        )


class FileCreationModel(BaseModel):
    name: str
    summary: str
    tags: list[str]
    template: StandaloneFeature


class CollectionFileController(Controller):
    path = "/collections/files"
    guards = [guard_user]
    dependencies = {"user": Provide(provide_user)}

    @get("/new/templates")
    async def get_file_templates(
        self, user: User, context: Context
    ) -> list[StandaloneFeature]:
        enabled_plugins = [
            context.plugins.get(i.target_id)
            for i in await user.get_links(
                target=Plugin, relation=EntityRelation.LINK, data={"type": "enabled"}
            )
            if context.plugins.get(i.target_id)
        ]

        features: list[StandaloneFeature] = []
        for plugin in enabled_plugins:
            for feature in plugin.manifest.features:
                if feature.type == "article-template":
                    features.append(StandaloneFeature.create(plugin, feature))

        return features

    @post("/new")
    async def create_file(self, user: User, data: FileCreationModel) -> FileEntity:
        new_file = FileEntity(
            name=data.name,
            summary=data.summary,
            tags=data.tags,
            template_plugin=data.template.plugin_info.slug,
            template_name=data.template.feature.name,
        )
        await new_file.save()
        await user.link_to(
            new_file, relation=EntityRelation.PARENT, data={"permission": "owner"}
        )
        return new_file

    @get("/")
    async def get_files(self, user: User) -> list[FileEntity]:
        links = await user.get_links(target=FileEntity, relation=EntityRelation.PARENT)
        return [await FileEntity.get(i.target_id) for i in links]
