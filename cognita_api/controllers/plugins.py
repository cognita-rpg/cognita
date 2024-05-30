import mimetypes
import os
from typing import AsyncGenerator
from litestar import Controller, get
from ..util import PluginManifest, Context, Plugin
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

    async def get_plugin_export_inner(
        self, context: Context, name: str, export: str, subpath: str
    ) -> Stream | list[str]:
        async def read_export(
            plugin: Plugin, export: str, subpath: str | None
        ) -> AsyncGenerator[bytes, None]:
            with plugin.get_export(export, subpath=subpath) as f:
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

        plug_export = plugin.manifest.exports.get(export)
        if plug_export.type in ["function", "component"]:
            return Stream(
                read_export(plugin, export, subpath=subpath),
                media_type="text/javascript",
            )
        elif plug_export.type == "asset":
            if not os.path.exists(os.path.join(plugin.folder, subpath.lstrip("/"))):
                raise NotFoundException("error.api.plugin.export.file_not_found")
            files = plugin.get_export_files(
                export,
                subpath=subpath.lstrip("/") if subpath and subpath != "/" else None,
            )
            if len(files) == 1:
                guessed_type = mimetypes.guess_type(files[0])
                return Stream(
                    read_export(
                        plugin,
                        export,
                        subpath=(
                            subpath.lstrip("/") if subpath and subpath != "/" else None
                        ),
                    ),
                    media_type=(
                        plug_export.mime_type
                        if plug_export.mime_type
                        else (
                            guessed_type if guessed_type else "application/octet-stream"
                        )
                    ),
                )
            else:
                return files

    @get("/{name:str}/export/{export:str}/{subpath:path}")
    async def get_plugin_export_file(
        self, context: Context, name: str, export: str, subpath: str
    ) -> Stream | list[str]:
        return await self.get_plugin_export_inner(context, name, export, subpath)

    @get("/{name:str}/export/{export:str}")
    async def get_plugin_export_root(
        self, context: Context, name: str, export: str
    ) -> Stream | list[str]:
        return await self.get_plugin_export_inner(context, name, export, None)
