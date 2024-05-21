import { ReactNode, useContext, useEffect, useState } from "react";
import { PluginProvider } from "./PluginProvider";
import { PluginContext, PluginContextType } from "./types";
import { PluginManifest } from "../../types/plugin";
import { ErrorBoundary } from "react-error-boundary";

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

export function usePluginExport<TExport = any>(
    name: string,
    exportName: string
): TExport | null {
    const [exp, setExp] = useState<TExport | null>(null);
    const plugin = usePlugin(name);
    const pluginContext = usePlugins();

    useEffect(() => {
        if (!exp) {
            if (
                pluginContext.state === "ready" &&
                plugin &&
                Object.keys(plugin.exports).includes(exportName)
            ) {
                pluginContext.loadExport(name, exportName)?.then((module) => {
                    if (
                        module &&
                        Object.keys(module).includes(
                            plugin.exports[exportName].function
                        )
                    ) {
                        setExp(module[plugin.exports[exportName].function]);
                        return;
                    } else {
                        setExp(null);
                    }
                });
            } else {
                setExp(null);
            }
        }
    }, [plugin?.metadata.name, pluginContext.state, setExp, exportName]);
    return exp;
}

function PluginComponentInner<TProps = any>({
    plugin,
    exportName,
    fallback,
    ...props
}: {
    plugin: string;
    exportName: string;
    fallback?: ((props: TProps) => ReactNode) | (() => ReactNode);
} & TProps) {
    const ExportedElement = usePluginExport<(props: TProps) => ReactNode>(
        plugin,
        exportName
    );
    const FallbackElement = fallback ?? (() => <></>);

    if (ExportedElement) {
        return <ExportedElement {...(props as any)} />;
    } else {
        return <FallbackElement {...(props as any)} />;
    }
}

export function PluginComponent<TProps = any>({
    plugin,
    exportName,
    fallback,
    ...props
}: {
    plugin: string;
    exportName: string;
    fallback?: ((props: TProps) => ReactNode) | (() => ReactNode);
} & TProps) {
    return (
        <ErrorBoundary
            fallback={(fallback ?? (() => <></>))(props as any) as any}
        >
            <PluginComponentInner
                plugin={plugin}
                exportName={exportName}
                fallback={fallback}
                {...(props as any)}
            />
        </ErrorBoundary>
    );
}
