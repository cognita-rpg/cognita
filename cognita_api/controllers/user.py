from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from ..util import guard_user, provide_user, Context, PluginManifest
from ..models import User, Session, RedactedUser, EntityLink, EntityType, EntityRelation


class UserSelfController(Controller):
    path = "/user"
    guards = [guard_user]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_current_user(self, user: User) -> RedactedUser:
        return user.redacted

    @post("/settings/plugins/{plugin:str}/enable")
    async def enable_plugin(self, user: User, plugin: str, context: Context) -> None:
        if not plugin in context.plugins.plugins.keys():
            raise NotFoundException("error.api.user.self.settings.plugin_not_found")

        existing = await EntityLink.get_links(
            user.id,
            source_type=EntityType.USER,
            target_id=plugin,
            target_type=EntityType.PLUGIN,
            relation_type=EntityRelation.LINK,
            data_query={"type": "enabled"},
        )
        if len(existing) > 0:
            return

        new_link = EntityLink.create_link(
            user, context.plugins.get(plugin), data={"type": "enabled"}
        )
        await new_link.save()

    @post("/settings/plugins/{plugin:str}/disable")
    async def disable_plugin(self, user: User, plugin: str, context: Context) -> None:
        if not plugin in context.plugins.plugins.keys():
            raise NotFoundException("error.api.user.self.settings.plugin_not_found")

        existing = await EntityLink.get_links(
            user.id,
            source_type=EntityType.USER,
            target_id=plugin,
            target_type=EntityType.PLUGIN,
            relation_type=EntityRelation.LINK,
            data_query={"type": "enabled"},
        )
        if len(existing) > 0:
            for i in existing:
                await i.delete()

    @get("/settings/plugins")
    async def get_enabled_plugins(self, user: User) -> list[PluginManifest]:
        links = await EntityLink.get_links(
            user.id,
            source_type=EntityType.USER,
            target_type=EntityType.PLUGIN,
            relation_type=EntityRelation.LINK,
            data_query={"type": "enabled"},
        )

        enabled_plugins = [await link.target() for link in links]
        return [i.manifest for i in enabled_plugins]
