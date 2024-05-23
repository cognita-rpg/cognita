import { useTranslation } from "react-i18next";
import { CollectionsMixin, useApiMethods } from "../../../util/api";
import { useEffect, useMemo, useState } from "react";
import {
    PluginArticleTemplateFeature,
    PluginFeatureReference,
} from "../../../types/plugin";
import { flatten, intersection, uniq } from "lodash";
import { useForm } from "@mantine/form";
import {
    Avatar,
    Badge,
    Button,
    Divider,
    Fieldset,
    Group,
    Image,
    MultiSelect,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    TagsInput,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import {
    IconCheck,
    IconFileDescription,
    IconFilePencil,
    IconFilter,
    IconPuzzleFilled,
    IconTag,
    IconTemplate,
    IconX,
} from "@tabler/icons-react";
import { DynamicIcon } from "../../DynamicIcon";
import { EventTrigger } from "../types";
import { useNotifs } from "../../../util/notifications";

function FeatureItem({
    feature,
    onSelect,
    onDeselect,
    selected,
}: {
    feature: PluginFeatureReference<PluginArticleTemplateFeature>;
    onSelect: () => void;
    onDeselect: () => void;
    selected: boolean;
}) {
    const { t } = useTranslation();
    return (
        <Paper
            className={"feature-item" + (selected ? " selected" : "")}
            p="xs"
            radius="xs"
            onClick={() => {
                if (selected) {
                    onDeselect();
                } else {
                    onSelect();
                }
            }}
        >
            <Stack gap="xs">
                <Group gap="xs">
                    {feature.feature_info.icon ? (
                        <DynamicIcon
                            name={feature.feature_info.icon}
                            fallback={IconTemplate}
                        />
                    ) : (
                        <IconTemplate />
                    )}
                    <Text>{feature.feature_info.name}</Text>
                </Group>
                <Text c="dimmed" size="sm">
                    {feature.feature_info.description ??
                        t("modals.newFile.field.template.item.no_desc")}
                </Text>
                <Divider />
                <Paper
                    p="xs"
                    radius="xs"
                    style={{
                        backgroundColor: "var(--mantine-color-default)",
                    }}
                >
                    <Group gap="sm" justify="space-between">
                        {feature.plugin_info.image ? (
                            <Avatar>
                                <Image
                                    src={feature.plugin_info.image}
                                    w={38}
                                    h={38}
                                />
                            </Avatar>
                        ) : (
                            <Avatar>
                                <IconPuzzleFilled />
                            </Avatar>
                        )}
                        {feature.plugin_info.version ? (
                            <Stack gap={2} align="end">
                                <Text size="sm">
                                    {feature.plugin_info.name}
                                </Text>
                                <Badge variant="light">
                                    {feature.plugin_info.version}
                                </Badge>
                            </Stack>
                        ) : (
                            <Text size="sm">{feature.plugin_info.name}</Text>
                        )}
                    </Group>
                </Paper>
            </Stack>
        </Paper>
    );
}

export function NewFileModal({ trigger }: { trigger: EventTrigger }) {
    const { t } = useTranslation();
    const api = useApiMethods(CollectionsMixin);

    const [templates, setTemplates] = useState<
        PluginFeatureReference<PluginArticleTemplateFeature>[]
    >([]);
    useEffect(() => {
        api.get_file_templates().then(setTemplates);
    }, []);

    const pluginNames = useMemo(
        () => uniq(templates.map((v) => v.plugin_info.name)),
        [templates]
    );
    const pluginTags = useMemo(
        () => uniq(flatten(templates.map((v) => v.feature_info.tags))),
        [templates]
    );

    const form = useForm<{
        name: string;
        summary: string;
        tags: string[];
        template: PluginFeatureReference<PluginArticleTemplateFeature> | null;
    }>({
        initialValues: {
            name: "",
            summary: "",
            tags: [],
            template: null,
        },
    });

    const [searchConstraints, setSearchConstraints] = useState<
        (`tag:${string}` | `plugin:${string}`)[]
    >([]);
    const [textSearch, setTextSearch] = useState<string>("");
    const [allowChange, setAllowChange] = useState<boolean>(false);

    const searchResults = useMemo(() => {
        const constrainedTags = searchConstraints
            .filter((v) => v.startsWith("tag:"))
            .map((v) => v.split(":")[1]);
        const constrainedPlugins = searchConstraints
            .filter((v) => v.startsWith("plugin:"))
            .map((v) => v.split(":")[1]);

        return templates.filter(
            (template) =>
                (constrainedTags.length === 0 ||
                    intersection(constrainedTags, template.feature_info.tags)
                        .length > 0) &&
                (constrainedPlugins.length === 0 ||
                    constrainedPlugins.includes(template.plugin_info.name)) &&
                (textSearch.length === 0 ||
                    textSearch
                        .toLowerCase()
                        .includes(
                            template.feature_info.name.toLowerCase() ?? ""
                        ) ||
                    template.feature_info.name
                        .toLowerCase()
                        .includes(textSearch.toLowerCase()))
        );
    }, [searchConstraints, textSearch, templates]);

    const { error, success } = useNotifs();

    return (
        <form
            onSubmit={form.onSubmit(console.log)}
            className="new-collection-file-form"
        >
            <Stack gap="xs">
                <Group gap="xs">
                    <TextInput
                        {...form.getInputProps("name")}
                        label={t("modals.newFile.field.name")}
                        leftSection={<IconFilePencil size={20} />}
                        style={{ flexGrow: 1 }}
                        withAsterisk
                    />
                    <TagsInput
                        {...form.getInputProps("tags")}
                        label={t("modals.newFile.field.tags")}
                        leftSection={<IconTag size={20} />}
                        style={{ flexGrow: 1 }}
                    />
                </Group>

                <Textarea
                    {...form.getInputProps("summary")}
                    label={t("modals.newFile.field.summary")}
                    autosize
                    minRows={2}
                    leftSection={<IconFileDescription size={20} />}
                />
                <Fieldset
                    p="xs"
                    radius="xs"
                    className="template-selector"
                    legend={
                        <span style={{ whiteSpace: "nowrap" }}>
                            {t("modals.newFile.field.template.title")}{" "}
                            <span
                                style={{ color: "var(--mantine-color-error)" }}
                            >
                                *
                            </span>
                        </span>
                    }
                >
                    <Stack gap="xs">
                        <MultiSelect
                            searchable
                            searchValue={textSearch}
                            onSearchChange={(value) => {
                                if (value.length === 0) {
                                    if (allowChange) {
                                        setAllowChange(false);
                                        setTextSearch(value);
                                    }
                                } else {
                                    setAllowChange(false);
                                    setTextSearch(value);
                                }
                            }}
                            onKeyDown={() => {
                                setAllowChange(true);
                            }}
                            data={[
                                {
                                    group: t(
                                        "modals.newFile.field.template.search.group.plugin"
                                    ),
                                    items: pluginNames.map((v) => ({
                                        value: `plugin:${v}`,
                                        label: v,
                                    })),
                                },
                                {
                                    group: t(
                                        "modals.newFile.field.template.search.group.tag"
                                    ),
                                    items: pluginTags.map((v) => ({
                                        value: `tag:${v}`,
                                        label: v,
                                    })),
                                },
                            ]}
                            value={searchConstraints}
                            onChange={setSearchConstraints as any}
                            hidePickedOptions
                            label={t(
                                "modals.newFile.field.template.search.label"
                            )}
                            leftSection={<IconFilter size={20} />}
                        />
                        <Paper
                            className="template-list"
                            p="xs"
                            radius="sm"
                            style={{
                                backgroundColor: "var(--mantine-color-default)",
                            }}
                            mah="40vh"
                        >
                            <ScrollArea className="template-scroll">
                                <SimpleGrid
                                    spacing="xs"
                                    verticalSpacing="xs"
                                    cols={{ base: 1, md: 2 }}
                                >
                                    {searchResults.map((result, index) => (
                                        <FeatureItem
                                            feature={result}
                                            key={index}
                                            onSelect={() =>
                                                form.setFieldValue(
                                                    "template",
                                                    result
                                                )
                                            }
                                            onDeselect={() => {
                                                if (
                                                    form.values.template &&
                                                    form.values.template
                                                        .feature_info.name ===
                                                        result.feature_info.name
                                                ) {
                                                    form.setFieldValue(
                                                        "template",
                                                        null
                                                    );
                                                }
                                            }}
                                            selected={
                                                form.values.template
                                                    ? form.values.template
                                                          .feature_info.name ===
                                                      result.feature_info.name
                                                    : false
                                            }
                                        />
                                    ))}
                                </SimpleGrid>
                            </ScrollArea>
                        </Paper>
                    </Stack>
                </Fieldset>
                <Group gap="sm" justify="end">
                    <Button
                        variant="light"
                        leftSection={<IconX size={20} />}
                        onClick={() => trigger("close")}
                    >
                        {t("common.action.cancel")}
                    </Button>
                    <Button
                        variant="filled"
                        leftSection={<IconCheck size={20} />}
                        disabled={
                            form.values.name.length === 0 ||
                            form.values.template === null
                        }
                        onClick={() =>
                            api
                                .create_entity({
                                    type: "file",
                                    name: form.values.name,
                                    summary: form.values.summary,
                                    tags: form.values.tags,
                                    parent: null,
                                    template: form.values.template as any,
                                })
                                .then((result) => {
                                    if (result) {
                                        success(t("modals.newFile.success"));
                                        trigger("close");
                                    } else {
                                        error(t("modals.newFile.error"));
                                    }
                                })
                        }
                    >
                        {t("common.action.create")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
