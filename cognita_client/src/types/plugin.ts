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

export type PluginManifest = {
    metadata: PluginMetadata;
    exports: { [key: string]: PluginExport };
};
