import { useContext, useEffect, useMemo, useState } from "react";
import {
    PluginContext,
    PluginContextType,
    ResolvedPluginExport,
    FullExport,
} from "./types";
import {
    PluginExport,
    PluginFeature,
    PluginFeatureReference,
    PluginManifest,
} from "../../types/plugin";
import createLoadRemoteModule, {
    createRequires,
} from "@paciolan/remote-module-loader";
import { PluginMixin, useApi, useApiMethods } from "../api";

export function usePlugins(): PluginContextType {
    return useContext(PluginContext);
}

export function usePluginReload(): () => Promise<{
    [key: string]: PluginManifest;
}> {
    const pluginContext = usePlugins();
    if (pluginContext.state === "ready") {
        return pluginContext.reloadPlugins;
    } else {
        return async () => ({});
    }
}

export function usePluginMap(): { [key: string]: PluginManifest } {
    const pluginContext = usePlugins();
    if (pluginContext.state === "ready") {
        return pluginContext.plugins;
    } else {
        return {};
    }
}

export function usePlugin(name: string): PluginManifest | null {
    const pluginContext = usePlugins();
    if (pluginContext.state === "ready") {
        return pluginContext.plugins[name] ?? null;
    } else {
        return null;
    }
}

function getPluginExport<TExport extends PluginExport>(
    plugins: PluginContextType,
    api: any,
    name: string,
    exportName: string
): FullExport<TExport> {
    const loadRemoteModule =
        plugins.state === "ready"
            ? createLoadRemoteModule({
                  requires: createRequires(plugins.dependencies),
              })
            : async (..._: any[]) => {};
    const plugin =
        plugins.state === "ready" ? plugins.plugins[name] ?? null : null;
    const exported = plugin ? plugin.exports[exportName] ?? null : null;

    let result: ResolvedPluginExport<TExport>;
    if (exported && plugins.state === "ready") {
        switch (exported.type) {
            case "component":
                result = async () => {
                    const module = await loadRemoteModule(
                        `/api/plugins/${name}/export/${exportName}`
                    );
                    if (Object.keys(module).includes(exported.function)) {
                        return module[exported.function];
                    } else {
                        return null;
                    }
                };
                break;
            case "function":
                result = async () => {
                    const module = await loadRemoteModule(
                        `/api/plugins/${name}/export/${exportName}`
                    );
                    if (Object.keys(module).includes(exported.function)) {
                        return module[exported.function];
                    } else {
                        return null;
                    }
                };
                break;
            case "asset":
                result = (async () => {
                    return {
                        getAsset: async (path?: string) =>
                            await api.get_plugin_asset(name, exportName, path),
                        getPaths: async (path?: string) =>
                            await api.get_plugin_files(name, exportName, path),
                    };
                }) as any;
                break;
        }
    } else {
        result = null;
    }

    return {
        pluginName: name,
        exportName,
        metadata: exported as any,
        resolver: result,
    };
}

export function usePluginExport(
    plugin: string,
    ...exports: string[]
): { [key: string]: FullExport } {
    const plugins = usePlugins();
    const api = useApi();
    const methods = useApiMethods(PluginMixin);

    const results = useMemo(() => {
        const output: {
            [key: string]: FullExport;
        } = {};

        for (const exp of exports) {
            output[exp] = getPluginExport(plugins, methods, plugin, exp);
        }

        return output;
    }, [plugin, exports.length, plugins.state, api.state]);
    return results;
}

export function usePluginFeature<TFeature extends PluginFeature = any>(
    plugin: string | null,
    name: string | null
): PluginFeatureReference<TFeature> | null {
    const plugins = usePlugins();
    const api = useApi();
    const methods = useApiMethods(PluginMixin);
    const [result, setResult] =
        useState<PluginFeatureReference<TFeature> | null>(null);

    useEffect(() => {
        if (plugin && name) {
            methods.get_plugin_feature(plugin, name).then(setResult);
        } else {
            setResult(null);
        }
    }, [plugins.state, api.state, plugin, name]);

    return result;
}
