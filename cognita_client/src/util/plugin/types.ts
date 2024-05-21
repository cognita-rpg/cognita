import { createContext } from "react";
import { PluginManifest } from "../../types/plugin";

export type PluginContextType =
    | {
          state: "ready";
          plugins: { [key: string]: PluginManifest };
          reloadPlugins: () => Promise<{ [key: string]: PluginManifest }>;
          loadExport: (
              plugin: string,
              exportName: string
          ) => Promise<{ [key: string]: any } | null>;
      }
    | {
          state: "loading";
      };

export const PluginContext = createContext<PluginContextType>({
    state: "loading",
});
