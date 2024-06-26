import { ReactNode, createContext } from "react";
import {
    PluginAssetExport,
    PluginComponentExport,
    PluginExport,
    PluginFunctionExport,
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
        ? {
              getAsset: (path?: string) => Promise<Blob | null>;
              getPaths: (path?: string) => Promise<string[]>;
          }
        : never;

export type ResolvedPluginExport<TExport extends PluginExport = PluginExport> =
    | (() => Promise<ResolvedExportType<TExport>>)
    | null;
export type FullExport<TExport extends PluginExport = PluginExport> = {
    pluginName: string;
    exportName: string;
    metadata: TExport | null;
    resolver: ResolvedPluginExport<TExport>;
};
