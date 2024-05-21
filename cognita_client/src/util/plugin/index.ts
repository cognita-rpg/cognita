import { useContext, useMemo } from "react";
import { PluginProvider } from "./PluginProvider";
import { PluginContext, PluginContextType, ResolvedExportType } from "./types";
import { PluginExport, PluginManifest } from "../../types/plugin";
import createLoadRemoteModule from "@paciolan/remote-module-loader";
import { useApi } from "../api";

export { PluginProvider };
export type { PluginContextType };

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

export function usePluginExport<TExport extends PluginExport>(
    name: string,
    exportName: string
): (() => Promise<ResolvedExportType<TExport>>) | null {
    const plugins = usePlugins();
    const api = useApi();
    const loadRemoteModule = useMemo(
        () =>
            plugins.state === "ready"
                ? createLoadRemoteModule(plugins.dependencies)
                : async (..._: any[]) => {},
        [plugins.state]
    );
    const plugin = useMemo(() => {
        if (plugins.state === "ready") {
            return plugins.plugins[name] ?? null;
        } else {
            return null;
        }
    }, [plugins.state]);
    const exported = useMemo(() => {
        if (plugin) {
            return plugin.exports[exportName] ?? null;
        } else {
            return null;
        }
    }, [plugin]);
    const result = useMemo(() => {
        if (exported && plugins.state === "ready") {
            switch (exported.type) {
                case "component":
                    return async () => {
                        const module = await loadRemoteModule(
                            `/api/plugins/${name}/export/${exportName}`
                        );
                        if (Object.keys(module).includes(exported.function)) {
                            return module[exported.function];
                        } else {
                            return null;
                        }
                    };
                case "function":
                    return async () => {
                        const module = await loadRemoteModule(
                            `/api/plugins/${name}/export/${exportName}`
                        );
                        if (Object.keys(module).includes(exported.function)) {
                            return module[exported.function];
                        } else {
                            return null;
                        }
                    };
                case "asset":
                    return async () =>
                        `/api/plugins/${name}/export/${exportName}`;
                case "json":
                    return async () => {
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
                    };
            }
        } else {
            return null;
        }
    }, [exported, plugins.state]);

    return result;
}
