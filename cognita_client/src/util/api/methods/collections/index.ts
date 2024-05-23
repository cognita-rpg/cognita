import {
    CollectionEntity,
    EntityCreate,
    ReducedEntity,
} from "../../../../types/collections";
import {
    PluginArticleTemplateFeature,
    PluginFeatureReference,
} from "../../../../types/plugin";
import { BaseAPIMethods, Constructor } from "../base";

export function CollectionsMixin<TBase extends Constructor<BaseAPIMethods>>(
    base: TBase
) {
    return class CollectionsMethods extends base {
        public async get_file_templates(): Promise<
            PluginFeatureReference<PluginArticleTemplateFeature>[]
        > {
            const result = await this.request<
                PluginFeatureReference<PluginArticleTemplateFeature>[]
            >("/collections/file_templates");
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }

        public async create_entity(
            options: EntityCreate
        ): Promise<CollectionEntity | null> {
            const result = await this.request<CollectionEntity>(
                "/collections/new",
                { method: "POST", body: options }
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        }

        public async get_entities(parent?: string): Promise<ReducedEntity[]> {
            const result = await this.request<ReducedEntity[]>("/collections", {
                params: parent ? { parent } : undefined,
            });
            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        }

        public async get_entity(id: string): Promise<CollectionEntity | null> {
            const result = await this.request<CollectionEntity>(
                `/collections/${id}`
            );
            if (result.success) {
                return result.data;
            } else {
                return null;
            }
        }
    };
}
