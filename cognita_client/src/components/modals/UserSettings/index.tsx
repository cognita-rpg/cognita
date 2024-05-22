import { ScrollAreaAutosize, Tabs } from "@mantine/core";
import { IconPuzzle, IconUserEdit } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { PluginPanel } from "./PluginPanel";

export function UserSettingsModal() {
    const { t } = useTranslation();
    return (
        <Tabs className="user-settings-tabs" defaultValue="profile">
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
            <Tabs.Panel
                pt="sm"
                value="profile"
                className="user-settings-panel profile"
            >
                <ScrollAreaAutosize className="user-settings-scroll">
                    eee
                </ScrollAreaAutosize>
            </Tabs.Panel>
            <Tabs.Panel
                pt="sm"
                value="plugins"
                className="user-settings-panel plugins"
            >
                <ScrollAreaAutosize className="user-settings-scroll">
                    <PluginPanel />
                </ScrollAreaAutosize>
            </Tabs.Panel>
        </Tabs>
    );
}
