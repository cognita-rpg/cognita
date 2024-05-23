import {
    Box,
    ScrollArea,
    Stack,
    Tooltip,
    ActionIcon,
    Paper,
    SimpleGrid,
    Group,
    Text,
    Divider,
    Badge,
    Avatar,
    Image,
} from "@mantine/core";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import {
    IconFolder,
    IconFileText,
    IconPhoto,
    IconPlus,
    IconFileDescription,
    IconTag,
    IconPuzzleFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { CollectionEntity, ReducedEntity } from "../../types/collections";
import { useModals } from "../../components/modals";
import { CollectionsMixin, useApiMethods } from "../../util/api";
import { useEffect, useState } from "react";
import { DynamicIcon } from "../../components/DynamicIcon";

function FolderItem({ entity }: { entity: ReducedEntity }) {
    const { t } = useTranslation();
    return (
        <Paper className="folder-item" p="xs" radius="sm">
            <Stack gap="xs">
                <Group justify="space-between" gap="xs">
                    {entity.type === "folder" && entity.icon ? (
                        <DynamicIcon name={entity.icon} fallback={IconFolder} />
                    ) : entity.type === "folder" ? (
                        <IconFolder />
                    ) : entity.type === "image" ? (
                        <IconPhoto />
                    ) : (
                        <IconFileText />
                    )}
                    <Text>{entity.name}</Text>
                </Group>
                <Paper p="xs" radius="xs">
                    <Stack gap="xs">
                        <Group gap="sm" justify="space-between" opacity={0.75}>
                            <IconFileDescription size={20} />
                            <Text size="sm">
                                {t("views.collections.item.summary")}
                            </Text>
                        </Group>
                        <Divider />
                        <Text
                            size="sm"
                            c={entity.summary ? undefined : "dimmed"}
                        >
                            {entity.summary ??
                                t("views.collections.item.no_summary")}
                        </Text>
                    </Stack>
                </Paper>
                <Paper p="xs" radius="xs">
                    <Stack gap="xs">
                        <Group gap="sm" justify="space-between" opacity={0.75}>
                            <IconTag size={20} />
                            <Text size="sm">
                                {t("views.collections.item.tags")}
                            </Text>
                        </Group>
                        <Divider />
                        {entity.tags.length > 0 ? (
                            <Group gap={4}>
                                {entity.tags.map((t, i) => (
                                    <Badge variant="light" key={i}>
                                        {t}
                                    </Badge>
                                ))}
                            </Group>
                        ) : (
                            <Text size="sm" c="dimmed">
                                {t("views.collections.item.no_tags")}
                            </Text>
                        )}
                    </Stack>
                </Paper>
                {entity.type === "file" && (
                    <Paper p="xs" radius="xs">
                        <Group gap="sm" justify="space-between">
                            {entity.template.plugin_info.image ? (
                                <Avatar>
                                    <Image
                                        src={entity.template.plugin_info.image}
                                        w={38}
                                        h={38}
                                    />
                                </Avatar>
                            ) : (
                                <Avatar>
                                    <IconPuzzleFilled />
                                </Avatar>
                            )}
                            {entity.template.plugin_info.version ? (
                                <Stack gap={2} align="end">
                                    <Text size="sm">
                                        {entity.template.plugin_info.name}
                                    </Text>
                                    <Badge variant="light">
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
                )}
            </Stack>
        </Paper>
    );
}

export function FolderViewer({ entity }: { entity: CollectionEntity | null }) {
    const [itemAdd, { toggle: toggleItemAdd, close: closeItemAdd }] =
        useDisclosure(false);
    const itemsRef = useClickOutside(() => closeItemAdd());
    const { t } = useTranslation();
    const { newCollectionFile } = useModals();
    const api = useApiMethods(CollectionsMixin);

    const [children, setChildren] = useState<ReducedEntity[]>([]);

    useEffect(() => {
        if (api.state === "ready") {
            api.get_entities(entity?.id).then(setChildren);
        }
    }, [api.state]);

    return (
        <Box className="folder-main">
            <ScrollArea className="folder-scroll" p="sm">
                <SimpleGrid
                    spacing="xs"
                    verticalSpacing="xs"
                    cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                >
                    {children.map((child) => (
                        <FolderItem entity={child} key={child.id} />
                    ))}
                </SimpleGrid>
            </ScrollArea>
            <Box
                className={"add-item-menu" + (itemAdd ? " active" : "")}
                ref={itemsRef}
            >
                <Stack className="add-item-stack" gap="sm" align="center">
                    <Stack className="add-item-items" gap="xs" align="center">
                        <Tooltip
                            position="left"
                            label={t("views.collections.add_item.folder")}
                            color="dark"
                        >
                            <ActionIcon
                                radius="xl"
                                size="lg"
                                className="add-item-option"
                                variant="light"
                            >
                                <IconFolder size={20} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip
                            position="left"
                            label={t("views.collections.add_item.file")}
                            color="dark"
                        >
                            <ActionIcon
                                radius="xl"
                                size="lg"
                                className="add-item-option"
                                variant="light"
                                onClick={() => {
                                    newCollectionFile();
                                    closeItemAdd();
                                }}
                            >
                                <IconFileText size={20} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip
                            position="left"
                            label={t("views.collections.add_item.image")}
                            color="dark"
                        >
                            <ActionIcon
                                radius="xl"
                                size="lg"
                                className="add-item-option"
                                variant="light"
                            >
                                <IconPhoto size={20} />
                            </ActionIcon>
                        </Tooltip>
                    </Stack>
                    <ActionIcon
                        radius="xl"
                        size="xl"
                        className="add-item-button"
                        onClick={toggleItemAdd}
                    >
                        <IconPlus />
                    </ActionIcon>
                </Stack>
            </Box>
        </Box>
    );
}
