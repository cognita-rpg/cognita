export type PluginMetadata = {
    slug: string;
    name: string;
    author: string | null;
    version: string | null;
    urls: { [key: string]: string };
    image?: string | null;
};

export type PluginComponentExport = {
    type: "component";
    file: string;
    function: string;
};

export type PluginFunctionExport = {
    type: "function";
    file: string;
    function: string;
};

export type PluginAssetExport = {
    type: "asset";
    file: string;
    mime_type: string;
};

export type PluginJSONExport = {
    type: "json";
    file: string;
};

export type PluginExport =
    | PluginComponentExport
    | PluginFunctionExport
    | PluginAssetExport
    | PluginJSONExport;

export type PluginArticleTemplateFeature = {
    type: "article-template";
    required_exports: string[];
    name: string;
    description: string | null;
    icon: string | null;
    tags: string[];
    form_renderer: string;
    text_renderer: string;
};

export type PluginCompendiumTemplateFeature = {
    type: "compendium-template";
    required_exports: string[];
    template_name: string;
    template_icon: string | null;
    renderer: string;
    resolve_name: string;
    resolve_icon: string | null;
    resolve_description: string | null;
    resolve_image: string | null;
    records: string;
};

export type PluginFeature =
    | PluginArticleTemplateFeature
    | PluginCompendiumTemplateFeature;

export type PluginManifest = {
    metadata: PluginMetadata;
    exports: { [key: string]: PluginExport };
    features: PluginFeature[];
};

export type PluginFeatureReference<TFeature extends PluginFeature> = {
    plugin_name: string;
    feature_name: string;
    plugin_info: PluginMetadata;
    exports: { [key: string]: PluginExport };
    feature_info: TFeature;
};
