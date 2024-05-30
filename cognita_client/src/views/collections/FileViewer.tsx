import {
    ActionIcon,
    ActionIconGroup,
    Avatar,
    Badge,
    Center,
    Divider,
    Group,
    Image,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { CollectionFileEntity } from "../../types/collections";
import { ExportedComponent, usePluginExport } from "../../util/plugin";
import { useTranslation } from "react-i18next";
import {
    IconEdit,
    IconEye,
    IconFileText,
    IconPuzzleFilled,
    IconSettings,
    IconTrashFilled,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useDebouncedValue, useDidUpdate, useMediaQuery } from "@mantine/hooks";
import { PluginWrapper } from "cognita-sdk";
import {
    CollectionsMixin,
    PluginMixin,
    useApiMethods,
    useSession,
} from "../../util/api";
import { useEvent } from "../../util/events";
import { usePluginFeature } from "../../util/plugin/hooks";
import { PluginArticleTemplateFeature } from "../../types/plugin";

type FileUpdateType = {
    id: string;
    origin: string;
    content: any;
};

export function FileViewer({ entity }: { entity: CollectionFileEntity }) {
    const { t } = useTranslation();
    const api = useApiMethods(CollectionsMixin, PluginMixin);
    const template = usePluginFeature<PluginArticleTemplateFeature>(
        entity.template.plugin,
        entity.template.feature
    );
    const exported = usePluginExport(
        entity.template.plugin,
        ...Object.keys(template?.exports ?? {})
    );
    const [mode, setMode] = useState<"edit" | "view">("view");
    const isMobile = useMediaQuery("(max-width: 600px)", false);
    const [content, setContent] = useState<any>(entity.content);
    const [localContent, setLocalContent] = useState<any>(entity.content);
    const [debouncedContent] = useDebouncedValue(localContent, 200);

    const session = useSession();

    useDidUpdate(() => {
        api.update_file_entity_contents(entity.id, debouncedContent);
    }, [debouncedContent, entity.id]);

    const onUpdate = useCallback(
        (update: FileUpdateType | null) => {
            if (update) {
                if (update.id === entity.id && update.origin !== session?.id) {
                    setContent(update.content);
                }
            }
        },
        [session?.id, setContent, entity.id]
    );

    useEvent("entity.update", onUpdate);

    const FileControls = useCallback(() => {
        return (
            <Group gap="xs" mr="sm">
                <ActionIconGroup>
                    <ActionIcon
                        variant="light"
                        bg={
                            mode === "edit"
                                ? "var(--mantine-primary-color-light-hover)"
                                : undefined
                        }
                        size="lg"
                        onClick={() => setMode("edit")}
                    >
                        <IconEdit size={20} />
                    </ActionIcon>
                    <ActionIcon
                        variant="light"
                        size="lg"
                        bg={
                            mode === "view"
                                ? "var(--mantine-primary-color-light-hover)"
                                : undefined
                        }
                        onClick={() => setMode("view")}
                    >
                        <IconEye size={20} />
                    </ActionIcon>
                </ActionIconGroup>
                <ActionIcon variant="light" size="lg">
                    <IconSettings size={20} />
                </ActionIcon>
                <ActionIcon variant="light" size="lg">
                    <IconTrashFilled size={20} />
                </ActionIcon>
            </Group>
        );
    }, [mode, setMode]);

    const FileTitle = useCallback(() => {
        return template ? (
            <Group gap="xs">
                <IconFileText />
                <Stack gap={2} style={{ flexGrow: isMobile ? 1 : undefined }}>
                    <Text>{entity.name}</Text>
                    <Text size="sm" c="dimmed">
                        {entity.summary && entity.summary.length > 0
                            ? entity.summary
                            : t("views.collections.file.no_summary")}
                    </Text>
                </Stack>
                {!isMobile && <Divider orientation="vertical" />}
                <Paper p="xs" radius="xs">
                    <Group gap="sm" justify="space-between">
                        {template.plugin_info.image ? (
                            <Avatar size="sm">
                                <Image
                                    src={template.plugin_info.image}
                                    w={28}
                                    h={28}
                                />
                            </Avatar>
                        ) : (
                            <Avatar>
                                <IconPuzzleFilled />
                            </Avatar>
                        )}
                        {template.plugin_info.version ? (
                            <Stack gap={2} align="end">
                                <Text size="xs">
                                    {template.plugin_info.name}
                                </Text>
                                <Badge variant="light" size="xs">
                                    {template.plugin_info.version}
                                </Badge>
                            </Stack>
                        ) : (
                            <Text size="sm">{template.plugin_info.name}</Text>
                        )}
                    </Group>
                </Paper>
            </Group>
        ) : (
            <></>
        );
    }, [entity, t, isMobile, template?.feature_name]);

    return template ? (
        <Stack gap="xs" className="file-main" p="xs">
            <Paper bg="var(--mantine-color-default" p={8}>
                {isMobile ? (
                    <Stack gap={8}>
                        <FileTitle />
                        <Center>
                            <FileControls />
                        </Center>
                    </Stack>
                ) : (
                    <Group gap="xs" justify="space-between">
                        <FileTitle />
                        <FileControls />
                    </Group>
                )}
            </Paper>
            <Paper withBorder p="sm" className="file-content">
                <PluginWrapper plugin={template}>
                    {mode === "edit" ? (
                        <ExportedComponent
                            exported={
                                exported[
                                    template.feature_info.form_renderer
                                ] as any
                            }
                            value={content}
                            onChange={(value: any) => {
                                setContent(value);
                                setLocalContent(value);
                            }}
                        />
                    ) : (
                        <ExportedComponent
                            exported={
                                exported[
                                    template.feature_info.text_renderer
                                ] as any
                            }
                            data={content}
                        />
                    )}
                </PluginWrapper>
            </Paper>
        </Stack>
    ) : (
        <></>
    );
}
