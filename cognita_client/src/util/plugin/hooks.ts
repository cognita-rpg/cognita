import { useContext, useMemo } from "react";
import {
    PluginContext,
    PluginContextType,
    ResolvedPluginExport,
    FullExport,
} from "./types";
import { PluginExport, PluginManifest } from "../../types/plugin";
import createLoadRemoteModule from "@paciolan/remote-module-loader";
import { ApiContextModel, useApi } from "../api";

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
    api: ApiContextModel,
    name: string,
    exportName: string
): FullExport<TExport> {
    const loadRemoteModule =
        plugins.state === "ready"
            ? createLoadRemoteModule(plugins.dependencies)
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
                result = async () =>
                    `/api/plugins/${name}/export/${exportName}` as any;
                break;
            case "json":
                result = (async () => {
                    if (api.state === "ready") {
                        const result = await api.request<object>({
                            path: `/plugins/${name}/export/${exportName}`,
                        });
                        if (result.success) {
                            return result.data;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
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

    const results = useMemo(() => {
        const output: {
            [key: string]: FullExport;
        } = {};

        for (const exp of exports) {
            output[exp] = getPluginExport(plugins, api, plugin, exp);
        }

        return output;
    }, [plugin, exports, plugins.state, api.state]);
    return results;
}
