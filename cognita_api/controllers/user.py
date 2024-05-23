from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from ..util import guard_user, provide_user, Context, PluginManifest, Plugin
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

        existing = await user.get_links(
            target=context.plugins.get(plugin),
            relation=EntityRelation.LINK,
            query={"data.type": "enabled"},
        )
        if len(existing) > 0:
            return

        await user.link_to(context.plugins.get(plugin), data={"type": "enabled"})

    @post("/settings/plugins/{plugin:str}/disable")
    async def disable_plugin(self, user: User, plugin: str, context: Context) -> None:
        if not plugin in context.plugins.plugins.keys():
            raise NotFoundException("error.api.user.self.settings.plugin_not_found")

        existing = await user.get_links(
            target=context.plugins.get(plugin),
            relation=EntityRelation.LINK,
            query={"data.type": "enabled"},
        )
        if len(existing) > 0:
            for i in existing:
                await i.delete()

    @get("/settings/plugins")
    async def get_enabled_plugins(
        self, user: User, context: Context
    ) -> list[PluginManifest]:
        links = await user.get_links(
            target=Plugin, relation=EntityRelation.LINK, query={"data.type": "enabled"}
        )
        enabled = [
            context.plugins.get(link.target_id).manifest
            for link in links
            if context.plugins.get(link.target_id)
        ]
        return enabled
