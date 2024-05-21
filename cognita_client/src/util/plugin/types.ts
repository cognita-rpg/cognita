import { ReactNode, createContext } from "react";
import {
    PluginAssetExport,
    PluginComponentExport,
    PluginExport,
    PluginFunctionExport,
    PluginJSONExport,
    PluginManifest,
} from "../../types/plugin";

export type PluginContextType =
    | {
          state: "ready";
          plugins: { [key: string]: PluginManifest };
          reloadPlugins: () => Promise<{ [key: string]: PluginManifest }>;
          dependencies: { [key: string]: any };
      }
    | {
          state: "loading";
      };

export const PluginContext = createContext<PluginContextType>({
    state: "loading",
});

export type ResolvedExportType<TExport extends PluginExport> =
    TExport extends PluginComponentExport
        ? (props: any) => ReactNode
        : TExport extends PluginFunctionExport
        ? (...args: any[]) => any
        : TExport extends PluginAssetExport
        ? string
        : TExport extends PluginJSONExport
        ? object
        : never;
