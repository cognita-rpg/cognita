from typing import AsyncGenerator
from litestar import Controller, MediaType, get
from ..util import (
    PluginManifest,
    PluginManifest_Metadata,
    PluginManifest_ExportEntry,
    Context,
    Plugin,
)
from litestar.exceptions import *
from litestar.response import Stream


class PluginController(Controller):
    path = "/plugins"

    @get("/")
    async def list_plugins(self, context: Context) -> list[PluginManifest]:
        return [i.manifest for i in context.plugins.plugins.values()]

    @get("/{name:str}")
    async def get_plugin(self, context: Context, name: str) -> PluginManifest:
        result = context.plugins.get(name)
        if not result:
            raise NotFoundException("error.api.plugin.unknown")

        return result.manifest

    @get("/{name:str}/export/{export:str}")
    async def get_plugin_export(
        self, context: Context, name: str, export: str
    ) -> Stream:
        async def read_export(
            plugin: Plugin, export: str
        ) -> AsyncGenerator[bytes, None]:
            with plugin.get_export(export) as f:
                while True:
                    chunk = f.read(256 * 1024)
                    if not chunk:
                        break
                    yield chunk

        plugin = context.plugins.get(name)
        if not plugin:
            raise NotFoundException("error.api.plugin.unknown")

        if not export in plugin.manifest.exports.keys():
            raise NotFoundException("error.api.plugin.export.unknown")

        return Stream(read_export(plugin, export), media_type="text/javascript")
