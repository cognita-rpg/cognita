export type PluginMetadata = {
    slug: string;
    name: string;
    author: string | null;
    version: string | null;
    urls: { [key: string]: string };
};

export type PluginExport = {
    file: string;
    function: string;
};

export type PluginManifest = {
    metadata: PluginMetadata;
    exports: { [key: string]: PluginExport };
};
