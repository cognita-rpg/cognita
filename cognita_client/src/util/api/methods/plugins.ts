import { PluginManifest } from "../../../types/plugin";
import { BaseAPIMethods, Constructor } from "./base";

export function PluginMixin<TBase extends Constructor<BaseAPIMethods>>(
    base: TBase
) {
    return class PluginMethods extends base {
        public async get_plugins(): Promise<PluginManifest[]> {
            const result = await this.request<PluginManifest[]>("/plugins");
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }

        public async get_plugin(slug: string): Promise<PluginManifest | null> {
            const result = await this.request<PluginManifest>(
                `/plugins/${slug}`
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        }

        public async get_plugin_asset(
            slug: string,
            export_name: string,
            path?: string
        ): Promise<Blob | null> {
            const result = await this.request<Blob>(
                `/plugins/${slug}/export/${export_name}${
                    path ? "/" + path : ""
                }`,
                { returnBody: true }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        }

        public async get_plugin_files(
            slug: string,
            export_name: string,
            path?: string
        ): Promise<string[]> {
            const result = await this.request<string[]>(
                `/plugins/${slug}/export/files/${export_name}${
                    path ? "/" + path : ""
                }`
            );
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }
    };
}
