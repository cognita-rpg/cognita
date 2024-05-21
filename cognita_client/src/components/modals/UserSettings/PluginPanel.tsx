import { useTranslation } from "react-i18next";
import { useApiMethods } from "../../../util/api";
import { PluginMixin } from "../../../util/api";
import { usePluginMap } from "../../../util/plugin";
import {
    ActionIcon,
    AspectRatio,
    Badge,
    Group,
    Image,
    Paper,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { PluginManifest } from "../../../types/plugin";
import {
    IconLink,
    IconPhotoOff,
    IconReload,
    IconSearch,
    IconUserEdit,
    IconVersions,
} from "@tabler/icons-react";
import { useState } from "react";

function PluginItem({ manifest }: { manifest: PluginManifest }) {
    const { t } = useTranslation();
    return (
        <Paper className="plugin-item" p="sm" radius="sm">
            <Stack gap="sm" className="plugin-stack">
                <Group
                    gap="sm"
                    justify="space-between"
                    className="plugin-header"
                >
                    <Text size="lg">{manifest.metadata.name}</Text>
                    <Switch />
                </Group>
                <Paper className="plugin-img-outer" radius="md" p={0}>
                    <AspectRatio
                        ratio={1080 / 720}
                        h="128px"
                        mx="auto"
                        className="plugin-img-wrapper"
                    >
                        {manifest.metadata.image ? (
                            <Image
                                className="plugin-img"
                                radius="sm"
                                width="100%"
                                src={manifest.metadata.image}
                            />
                        ) : (
                            <IconPhotoOff
                                size={48}
                                opacity={0.7}
                                className="plugin-img"
                            />
                        )}
                    </AspectRatio>
                </Paper>
                <Group gap="sm" justify="space-between">
                    <Group gap="xs">
                        <IconVersions />
                        <Text fw="bold">
                            {t("modals.user_settings.tab.plugins.item.version")}
                        </Text>
                    </Group>
                    {manifest.metadata.version ? (
                        <Text>{manifest.metadata.version}</Text>
                    ) : (
                        <Text c="dimmed">---</Text>
                    )}
                </Group>
                <Group gap="sm" justify="space-between">
                    <Group gap="xs">
                        <IconUserEdit />
                        <Text fw="bold">
                            {t("modals.user_settings.tab.plugins.item.author")}
                        </Text>
                    </Group>
                    {manifest.metadata.author ? (
                        <Text maw="75%" lineClamp={1}>
                            {manifest.metadata.author}
                        </Text>
                    ) : (
                        <Text c="dimmed">---</Text>
                    )}
                </Group>
                <Group gap="xs">
                    {Object.entries(manifest.metadata.urls).map(
                        ([name, value]) => (
                            <Badge
                                key={name}
                                variant="light"
                                leftSection={<IconLink size={16} />}
                                pl={4}
                                onClick={() => window.open(value, "_blank")}
                                className="plugin-link"
                            >
                                {name}
                            </Badge>
                        )
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

export function PluginPanel() {
    const { t } = useTranslation();
    const api = useApiMethods(PluginMixin);
    const plugins = usePluginMap();
    const [search, setSearch] = useState<string>("");

    return (
        <Stack gap="sm" className="plugin-panel">
            <Group gap="xs" wrap="nowrap">
                <ActionIcon size="lg" variant="light">
                    <IconReload size="20" />
                </ActionIcon>
                <TextInput
                    style={{ flexGrow: 1 }}
                    variant="filled"
                    leftSection={<IconSearch size={16} />}
                    placeholder={t("modals.user_settings.tab.plugins.search")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </Group>
            <SimpleGrid
                className="plugin-grid"
                cols={{ base: 1, sm: 2 }}
                spacing={"sm"}
                verticalSpacing={"sm"}
            >
                {Object.values(plugins).map((v) => (
                    <PluginItem key={v.metadata.slug} manifest={v} />
                ))}
            </SimpleGrid>
        </Stack>
    );
}
