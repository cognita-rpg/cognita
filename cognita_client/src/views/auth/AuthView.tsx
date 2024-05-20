import { Group, Paper, Stack, Text } from "@mantine/core";
import { IconMapRoute } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function AuthenticationView() {
    const { t } = useTranslation();
    return (
        <Stack className="auth-panel" gap="sm">
            <Paper className="auth-section title" p="sm" radius="sm">
                <Group
                    gap="sm"
                    justify="space-between"
                    align="end"
                    className="auth-title"
                >
                    <IconMapRoute size={32} />
                    <Text size="xl">{t("common.appName")}</Text>
                </Group>
            </Paper>
        </Stack>
    );
}
