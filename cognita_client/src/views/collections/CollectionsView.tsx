import { ActionIcon, Box, ScrollArea, Stack, Tooltip } from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import {
    IconFileText,
    IconFolder,
    IconPhoto,
    IconPlus,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useModals } from "../../components/modals";

export function CollectionsView() {
    const [itemAdd, { toggle: toggleItemAdd, close: closeItemAdd }] =
        useDisclosure(false);
    const itemsRef = useClickOutside(() => closeItemAdd());
    const { t } = useTranslation();
    const { newCollectionFile } = useModals();
    return (
        <Box className="collections-main">
            <ScrollArea className="collections-scroll" p="sm"></ScrollArea>
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
