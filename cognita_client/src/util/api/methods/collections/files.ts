import {
    PluginArticleTemplateFeature,
    PluginFeatureReference,
} from "../../../../types/plugin";
import { BaseAPIMethods, Constructor } from "../base";

export function CollectionFilesMixin<TBase extends Constructor<BaseAPIMethods>>(
    base: TBase
) {
    return class CollectionFilesMethods extends base {
        public async get_available_file_templates(): Promise<
            PluginFeatureReference<PluginArticleTemplateFeature>[]
        > {
            const result = await this.request<
                PluginFeatureReference<PluginArticleTemplateFeature>[]
            >("/collections/files/new/templates");
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }
    };
}
