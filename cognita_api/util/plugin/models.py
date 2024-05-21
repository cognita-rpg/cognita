from pydantic import BaseModel


class PluginManifest_Metadata(BaseModel):
    slug: str
    name: str
    author: str | None = None
    version: str | None = None
    urls: dict[str, str] = {}
    image: str | None = None


class PluginManifest_ExportEntry(BaseModel):
    file: str
    function: str


class PluginManifest(BaseModel):
    metadata: PluginManifest_Metadata
    exports: dict[str, PluginManifest_ExportEntry] = {}
