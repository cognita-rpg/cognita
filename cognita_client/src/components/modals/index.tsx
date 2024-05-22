import { ReactNode, useCallback } from "react";
import { ModalContentProps, EventTrigger } from "./types";
import { modals } from "@mantine/modals";
import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconUserCog } from "@tabler/icons-react";
import { UserSettingsModal } from "./UserSettings";

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
}): (props?: TProps & { onEvent?: EventTrigger }) => void {
    const RenderElement: any = renderer;
    const activateModal = useCallback(
        (props?: TProps & { onEvent?: EventTrigger }) => {
            const { onEvent, ...renderProps } = props ?? {};
            modals.open({
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
                        trigger={onEvent ?? (() => {})}
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

    return {
        userSettings,
    };
}
