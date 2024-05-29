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
    file_selector: str
    mime_type: str | None = None


EXPORT_TYPES = PluginComponentExport | PluginFunctionExport | PluginAssetExport


class PluginBaseFeature(BaseModel):
    type: str
    required_exports: list[str]


class PluginArticleTemplateFeature(PluginBaseFeature):
    """Feature model for article templates"""

    type: Literal["article-template"] = "article-template"

    # Template name
    name: str
    # Template description
    description: str | None = None
    # Template icon
    icon: str | None = None
    # Template tags
    tags: list[str] = []
    # Template form renderer (Component export) - When in edit mode
    form_renderer: str
    # Template text renderer (Component export) - When in viewing mode
    text_renderer: str


class PluginCompendiumTemplateFeature(PluginBaseFeature):
    """Feature model for compendium entries"""

    type: Literal["compendium-template"] = "compendium-template"

    # Template name
    template_name: str
    # Template icon
    template_icon: str | None = None
    # Template renderer (Component export)
    renderer: str
    # Item name resolver (Function export -> string)
    resolve_name: str
    # Item icon resolver (Function export -> ReactNode)
    resolve_icon: str | None = None
    # Item description resolver (Function export -> string)
    resolve_description: str | None = None
    # Item image resolver (Function export -> image URI)
    resolve_image: str | None = None
    # Records/data source (JSON export, [{record}, {record}, ...])
    records: str


FEATURE_TYPES = PluginArticleTemplateFeature | PluginCompendiumTemplateFeature


class PluginManifest(BaseModel):
    metadata: PluginManifest_Metadata
    exports: dict[str, EXPORT_TYPES] = {}
    features: list[FEATURE_TYPES] = []


class PluginFeatureReference(BaseModel):
    plugin_name: str
    feature_name: str
    plugin_info: PluginManifest_Metadata | None = None
    exports: dict[str, EXPORT_TYPES] = {}
    feature_info: FEATURE_TYPES | None = None

    @classmethod
    def from_feature(
        cls, plugin: PluginManifest, feature: str
    ) -> "PluginFeatureReference":
        features = [i for i in plugin.features if i.name == feature]
        if len(features) == 1:
            feature_info = features[0]
        else:
            feature_info = None

        if feature_info:
            exports = {
                i: plugin.exports[i]
                for i in feature_info.required_exports
                if i in plugin.exports.keys()
            }
        else:
            exports = {}

        return PluginFeatureReference(
            plugin_name=plugin.metadata.slug,
            feature_name=feature,
            plugin_info=plugin.metadata,
            exports=exports,
            feature_info=feature_info,
        )
