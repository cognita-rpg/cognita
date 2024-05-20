import { notifications } from "@mantine/notifications";
import {
    IconAlertTriangleFilled,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconInfoCircleFilled,
} from "@tabler/icons-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useNotifs() {
    const { t } = useTranslation();
    const success = useCallback(
        (message: string, title?: string) => {
            return notifications.show({
                color: "green",
                icon: <IconCircleCheckFilled />,
                title: title ?? t("common.notif.success"),
                message,
            });
        },
        [notifications.show]
    );

    const warning = useCallback(
        (message: string, title?: string) => {
            return notifications.show({
                color: "yellow",
                icon: <IconAlertTriangleFilled />,
                title: title ?? t("common.notif.warning"),
                message,
            });
        },
        [notifications.show]
    );

    const info = useCallback(
        (message: string, title?: string) => {
            return notifications.show({
                color: "teal",
                icon: <IconInfoCircleFilled />,
                title: title ?? t("common.notif.info"),
                message,
            });
        },
        [notifications.show]
    );

    const error = useCallback(
        (message: string, title?: string) => {
            return notifications.show({
                color: "red",
                icon: <IconCircleXFilled />,
                title: title ?? t("common.notif.error"),
                message,
            });
        },
        [notifications.show]
    );

    return {
        success,
        warning,
        error,
        info,
    };
}
