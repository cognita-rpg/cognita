import { createRequires } from "@paciolan/remote-module-loader";
import * as react from "react";
import * as reactJsx from "react/jsx-runtime";
import * as reactDom from "react-dom";
import * as mantineCore from "@mantine/core";
import * as mantineHooks from "@mantine/hooks";
import * as mantineForm from "@mantine/form";
import { PluginContext } from "./types";
import { useApiMethods, useApiState } from "../api";
import { PluginMixin } from "../api/methods";
import { PluginManifest } from "../../types/plugin";

export function PluginProvider({
    children,
}: {
    children?: react.ReactNode | react.ReactNode[];
}) {
    const dependencies = react.useMemo(
        () =>
            createRequires({
                react: react,
                "react/jsx-runtime": reactJsx,
                "react-dom": reactDom,
                "@mantine/core": mantineCore,
                "@mantine/hooks": mantineHooks,
                "@mantine/form": mantineForm,
            }),
        []
    );
    const apiState = useApiState();
    const api = useApiMethods(PluginMixin);
    const [plugins, setPlugins] = react.useState<{
        [key: string]: PluginManifest;
    }>({});
    const reload = react.useCallback(async () => {
        let newPlugins = {};
        if (apiState === "ready" && api.context.state === "ready") {
            const result = await api.get_plugins();
            newPlugins = result.reduce(
                (prev, cur) => ({ ...prev, [cur.metadata.slug]: cur }),
                {}
            );
        }
        setPlugins(newPlugins);
        return newPlugins;
    }, [apiState, api.get_plugins, api.context.state]);

    react.useEffect(() => {
        reload();
    }, [reload, apiState, api.context.state]);

    return (
        <PluginContext.Provider
            value={
                apiState === "ready"
                    ? {
                          state: "ready",
                          plugins,
                          reloadPlugins: reload,
                          dependencies,
                      }
                    : { state: "loading" }
            }
        >
            {children}
        </PluginContext.Provider>
    );
}
