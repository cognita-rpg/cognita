import { User } from "../../../types/auth";
import { PluginManifest } from "../../../types/plugin";
import { ApiResponseError } from "../types";
import { BaseAPIMethods, Constructor } from "./base";

export function UserSelfMixin<TBase extends Constructor<BaseAPIMethods>>(
    base: TBase
) {
    return class UserSelfMethods extends base {
        public async get(): Promise<User | null> {
            const result = await this.request<User>("/user");
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        }

        public async set_plugin_enabled(
            plugin: string,
            enabled: boolean
        ): Promise<null | ApiResponseError<string>> {
            const result = await this.request<null>(
                `/user/settings/plugins/${plugin}/${
                    enabled ? "enable" : "disable"
                }`,
                { method: "POST" }
            );
            if (result.success) {
                return null;
            } else {
                return result;
            }
        }

        public async get_enabled_plugins(): Promise<PluginManifest[]> {
            const result = await this.request<PluginManifest[]>(
                "/user/settings/plugins"
            );
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }
    };
}
