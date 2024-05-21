import { Tabs } from "@mantine/core";
import { IconPuzzle, IconUserEdit } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function UserSettingsModal() {
    const { t } = useTranslation();
    return (
        <Tabs
            className="user-settings-tabs"
            orientation="vertical"
            defaultValue="profile"
        >
            <Tabs.List>
                <Tabs.Tab
                    value="profile"
                    leftSection={<IconUserEdit size={20} />}
                >
                    {t("modals.user_settings.tab.profile.title")}
                </Tabs.Tab>
                <Tabs.Tab
                    value="plugins"
                    leftSection={<IconPuzzle size={20} />}
                >
                    {t("modals.user_settings.tab.plugins.title")}
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel pl="sm" value="profile">
                eee
            </Tabs.Panel>
            <Tabs.Panel pl="sm" value="plugins">
                eee
            </Tabs.Panel>
        </Tabs>
    );
}
