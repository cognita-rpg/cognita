import { ReactNode, useCallback } from "react";
import { ModalContentProps, EventTrigger, ModalEvent } from "./types";
import { modals } from "@mantine/modals";
import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconFilePlus, IconFolderPlus, IconUserCog } from "@tabler/icons-react";
import { UserSettingsModal } from "./UserSettings";
import { NewFileModal } from "./CollectionModals/NewFileModal";
import { useId } from "@mantine/hooks";
import { NewFolderModal } from "./CollectionModals/NewFolderModal";

function useModal<TProps = any>({
    title,
    subtitle,
    icon,
    renderer,
    modalSettings,
}: {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    renderer: (props: ModalContentProps<TProps>) => ReactNode;
    modalSettings?: Partial<Parameters<typeof modals.open>[0]>;
}): (props?: Partial<TProps> & { onEvent?: EventTrigger }) => void {
    const RenderElement: any = renderer;
    const id = useId();
    const activateModal = useCallback(
        (props?: Partial<TProps> & { onEvent?: EventTrigger }) => {
            const { onEvent, ...renderProps } = props ?? {};
            modals.open({
                modalId: id,
                title: (
                    <Group gap="sm">
                        {icon}
                        {subtitle ? (
                            <Stack gap={0}>
                                <Text>{title}</Text>
                                <Text c="dimmed" size="sm">
                                    {subtitle}
                                </Text>
                            </Stack>
                        ) : (
                            <Text>{title}</Text>
                        )}
                    </Group>
                ),
                onClose: () => (onEvent ? onEvent("close") : null),
                children: (
                    <RenderElement
                        trigger={(event: ModalEvent, data?: any) => {
                            if (event === "close") {
                                modals.close(id);
                            }

                            (onEvent ?? (() => {}))(event, data);
                        }}
                        {...renderProps}
                    />
                ),
                ...modalSettings,
            });
        },
        [title, subtitle, icon, renderer]
    );
    return activateModal;
}

export function useModals() {
    const { t } = useTranslation();
    const userSettings = useModal({
        title: t("modals.user_settings.title"),
        icon: <IconUserCog />,
        renderer: UserSettingsModal,
        modalSettings: {
            size: "xl",
            classNames: {
                body: "user-settings-body",
            },
        },
    });

    const newCollectionFile = useModal({
        title: t("modals.newFile.title"),
        icon: <IconFilePlus />,
        renderer: NewFileModal,
        modalSettings: {
            size: "xl",
        },
    });

    const newCollectionFolder = useModal({
        title: t("modals.newFolder.title"),
        icon: <IconFolderPlus />,
        renderer: NewFolderModal,
        modalSettings: {
            size: "xl",
        },
    });

    return {
        userSettings,
        newCollectionFile,
        newCollectionFolder,
    };
}
