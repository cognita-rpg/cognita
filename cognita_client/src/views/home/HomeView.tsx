import { useEffect, useMemo, useState } from "react";
import { CollectionFilesMixin, useApiMethods } from "../../util/api";
import { CollectionFileEntity } from "../../types/collections";
import {
    ExportedComponent,
    usePlugin,
    usePluginExport,
} from "../../util/plugin";
import { FileTemplateFormProps } from "cognita-sdk";

const DOCUMENTID = "4OaByZ-QZdOU-hhfvHIxtQ";

export function HomeView() {
    // TEST STUFF FOR PLUGIN TESTING
    const api = useApiMethods(CollectionFilesMixin);
    const [file, setFile] = useState<CollectionFileEntity | null>(null);

    useEffect(() => {
        if (api.state === "ready") {
            api.get_file(DOCUMENTID).then(setFile);
        } else {
            setFile(null);
        }
    }, [api.state]);

    const plugin = usePlugin(file?.template_plugin ?? "noop");
    const feature = useMemo(() => {
        if (plugin) {
            return (
                plugin.features.filter(
                    (v) =>
                        v.type === "article-template" &&
                        v.name === file?.template_name
                )[0] ?? null
            );
        }
    }, [plugin]);

    const exported = usePluginExport(
        plugin?.metadata.slug ?? "noop",
        ...(feature?.required_exports ?? [])
    );

    const [field, setField] = useState<{ field: string }>({ field: "" });
    console.log(field);

    return exported?.TestDocumentForm ? (
        <ExportedComponent<FileTemplateFormProps>
            exported={exported.TestDocumentForm as any}
            value={field}
            onChange={setField as any}
        />
    ) : (
        <></>
    );
}
