import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthMixin, useApi, useApiMethods } from "../../util/api";
import { useEffect } from "react";
import {
    ActionIcon,
    AppShell,
    Avatar,
    Burger,
    Button,
    Divider,
    Drawer,
    Group,
    Menu,
    Space,
    Stack,
    Text,
} from "@mantine/core";
import {
    IconBooks,
    IconHome,
    IconLogout,
    IconLogout2,
    IconMapRoute,
    IconNotebook,
    IconSettings,
    IconUser,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

export function Layout() {
    const api = useApi();
    const apiMethods = useApiMethods(AuthMixin);
    const location = useLocation();
    const nav = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (api.state === "ready") {
            if (!api.user && location.pathname !== "/auth") {
                nav("/auth");
            }
        }
    }, [api.state, (api as any).user, location.pathname]);
    const isMobile = useMediaQuery("(max-width: 600px)");
    const [mobileMenu, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
        useDisclosure(false);

    return (
        <AppShell className="app-layout">
            <AppShell.Header h="48">
                <Group
                    justify="space-between"
                    gap="sm"
                    h="100%"
                    pl="sm"
                    pr="sm"
                >
                    <Group gap="sm" h="100%" align="center">
                        <IconMapRoute size={28} />
                        <Text size="lg">{t("common.appName")}</Text>
                    </Group>
                    {isMobile ? (
                        <Burger
                            opened={mobileMenu}
                            onClick={toggleMobileMenu}
                            size="sm"
                        />
                    ) : (
                        <Group gap={0}>
                            <Button
                                leftSection={<IconHome size={20} />}
                                variant="subtle"
                                justify="space-between"
                            >
                                {t("views.layout.nav.home")}
                            </Button>
                            <Button
                                leftSection={<IconNotebook size={20} />}
                                variant="subtle"
                                justify="space-between"
                            >
                                {t("views.layout.nav.projects")}
                            </Button>
                            <Button
                                leftSection={<IconBooks size={20} />}
                                variant="subtle"
                                justify="space-between"
                            >
                                {t("views.layout.nav.compendium")}
                            </Button>
                            <Space w="sm" />
                            <Menu withArrow>
                                <Menu.Target>
                                    <Avatar size="md" className="user-menu">
                                        <IconUser size={20} />
                                    </Avatar>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconSettings size={16} />}
                                    >
                                        {t(
                                            "views.layout.nav.user_actions.settings"
                                        )}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        leftSection={<IconLogout2 size={16} />}
                                        onClick={() =>
                                            apiMethods
                                                .logout()
                                                .then(() => nav("/auth"))
                                        }
                                    >
                                        {t(
                                            "views.layout.nav.user_actions.logout"
                                        )}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    )}
                </Group>
            </AppShell.Header>
            <AppShell.Main className="app-main">
                <Outlet />
            </AppShell.Main>
            <Drawer.Root
                opened={(isMobile ?? false) && mobileMenu}
                onClose={closeMobileMenu}
            >
                <Drawer.Overlay />
                <Drawer.Content>
                    <Drawer.Header h="60">
                        <Drawer.CloseButton />
                    </Drawer.Header>
                    <Drawer.Body className="mobile-nav">
                        <Stack gap="xs" className="mobile-nav-stack">
                            <Stack gap="xs" className="mobile-nav-items">
                                <Button
                                    size="lg"
                                    leftSection={<IconHome size={24} />}
                                    variant="subtle"
                                    justify="space-between"
                                >
                                    {t("views.layout.nav.home")}
                                </Button>
                                <Button
                                    size="lg"
                                    leftSection={<IconNotebook size={24} />}
                                    variant="subtle"
                                    justify="space-between"
                                >
                                    {t("views.layout.nav.projects")}
                                </Button>
                                <Button
                                    size="lg"
                                    leftSection={<IconBooks size={24} />}
                                    variant="subtle"
                                    justify="space-between"
                                >
                                    {t("views.layout.nav.compendium")}
                                </Button>
                            </Stack>
                            <Divider />
                            <Group gap="sm" className="mobile-nav-user-actions">
                                <Avatar>
                                    <IconUser />
                                </Avatar>
                                <ActionIcon size={42} variant="light">
                                    <IconSettings />
                                </ActionIcon>
                                <Button
                                    rightSection={<IconLogout />}
                                    h={42}
                                    variant="light"
                                    style={{ flexGrow: 1 }}
                                    justify="space-between"
                                    onClick={() =>
                                        apiMethods
                                            .logout()
                                            .then(() => nav("/auth"))
                                    }
                                >
                                    {t("views.layout.nav.user_actions.logout")}
                                </Button>
                            </Group>
                        </Stack>
                    </Drawer.Body>
                </Drawer.Content>
            </Drawer.Root>
        </AppShell>
    );
}
