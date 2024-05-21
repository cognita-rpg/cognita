from typing import Literal
from pydantic import BaseModel


class PluginManifest_Metadata(BaseModel):
    slug: str
    name: str
    author: str | None = None
    version: str | None = None
    urls: dict[str, str] = {}
    image: str | None = None


class PluginComponentExport(BaseModel):
    type: Literal["component"] = "component"
    file: str
    function: str


class PluginFunctionExport(BaseModel):
    type: Literal["function"] = "function"
    file: str
    function: str


class PluginAssetExport(BaseModel):
    type: Literal["asset"] = "asset"
    file: str
    mime_type: str = "application/octet-stream"


class PluginJSONExport(BaseModel):
    type: Literal["json"] = "json"
    file: str


EXPORT_TYPES = (
    PluginComponentExport | PluginFunctionExport | PluginAssetExport | PluginJSONExport
)


class PluginManifest(BaseModel):
    metadata: PluginManifest_Metadata
    exports: dict[str, EXPORT_TYPES] = {}
