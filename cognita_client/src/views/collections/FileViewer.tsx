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
import { useMediaQuery } from "@mantine/hooks";
import { PluginWrapper } from "cognita-sdk";

export function FileViewer({ entity }: { entity: CollectionFileEntity }) {
    const { t } = useTranslation();
    const exported = usePluginExport(
        entity.template.plugin_name,
        ...Object.keys(entity.template.exports)
    );
    const [mode, setMode] = useState<"edit" | "view">("view");
    const isMobile = useMediaQuery("(max-width: 600px)", false);
    const [content, setContent] = useState<any>(entity.content);

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
        return (
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
                        {entity.template.plugin_info.image ? (
                            <Avatar size="sm">
                                <Image
                                    src={entity.template.plugin_info.image}
                                    w={28}
                                    h={28}
                                />
                            </Avatar>
                        ) : (
                            <Avatar>
                                <IconPuzzleFilled />
                            </Avatar>
                        )}
                        {entity.template.plugin_info.version ? (
                            <Stack gap={2} align="end">
                                <Text size="xs">
                                    {entity.template.plugin_info.name}
                                </Text>
                                <Badge variant="light" size="xs">
                                    {entity.template.plugin_info.version}
                                </Badge>
                            </Stack>
                        ) : (
                            <Text size="sm">
                                {entity.template.plugin_info.name}
                            </Text>
                        )}
                    </Group>
                </Paper>
            </Group>
        );
    }, [entity, t, isMobile]);

    return (
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
                <PluginWrapper plugin={entity.template}>
                    {mode === "edit" ? (
                        <ExportedComponent
                            exported={
                                exported[
                                    entity.template.feature_info.form_renderer
                                ] as any
                            }
                            value={content}
                            onChange={setContent}
                        />
                    ) : (
                        <ExportedComponent
                            exported={
                                exported[
                                    entity.template.feature_info.text_renderer
                                ] as any
                            }
                            data={content}
                        />
                    )}
                </PluginWrapper>
            </Paper>
        </Stack>
    );
}
