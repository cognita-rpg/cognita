import {
    Button,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconLock,
    IconLockCheck,
    IconLogin2,
    IconMapRoute,
    IconUser,
    IconUserPlus,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useApiMethods, AuthMixin } from "../../util/api";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { PasswordInput } from "../../components/PasswordInput";

function AuthCreatePanel({
    setMode,
}: {
    setMode: (mode: "create" | "login") => void;
}) {
    const { t } = useTranslation();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
            passwordConfirm: "",
        },
    });
    return (
        <Paper className="auth-section create" p="sm" radius="sm">
            <form onSubmit={form.onSubmit(console.log)}>
                <Stack gap="xs">
                    <Group gap="sm" justify="space-between">
                        <IconUserPlus />
                        <Text size="lg" fw={300}>
                            {t("views.auth.create.title")}
                        </Text>
                    </Group>
                    <Divider />
                    <TextInput
                        {...form.getInputProps("username")}
                        label={t("views.auth.create.username")}
                        leftSection={<IconUser size={16} />}
                    />
                    <PasswordInput
                        {...form.getInputProps("password")}
                        label={t("views.auth.create.password")}
                        leftSection={<IconLock size={16} />}
                    />
                    <PasswordInput
                        {...form.getInputProps("passwordConfirm")}
                        label={t("views.auth.create.passwordConfirm")}
                        leftSection={<IconLockCheck size={16} />}
                    />
                    <Group justify="space-between" gap="sm" grow>
                        <Button
                            variant="light"
                            leftSection={<IconLogin2 size={20} />}
                            justify="space-between"
                            onClick={() => setMode("login")}
                        >
                            {t("views.auth.create.switch")}
                        </Button>
                        <Button
                            variant="filled"
                            leftSection={<IconUserPlus size={20} />}
                            justify="space-between"
                            type="submit"
                        >
                            {t("views.auth.create.submit")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}

function AuthLoginPanel({
    setMode,
}: {
    setMode: (mode: "create" | "login") => void;
}) {
    const { t } = useTranslation();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
    });
    return (
        <Paper className="auth-section login" p="sm" radius="sm">
            <form onSubmit={form.onSubmit(console.log)}>
                <Stack gap="xs">
                    <Group gap="sm" justify="space-between">
                        <IconLogin2 />
                        <Text size="lg" fw={300}>
                            {t("views.auth.login.title")}
                        </Text>
                    </Group>
                    <Divider />
                    <TextInput
                        {...form.getInputProps("username")}
                        label={t("views.auth.login.username")}
                        leftSection={<IconUser size={16} />}
                    />
                    <PasswordInput
                        {...form.getInputProps("password")}
                        label={t("views.auth.login.password")}
                        leftSection={<IconLock size={16} />}
                    />
                    <Group justify="space-between" gap="sm" grow>
                        <Button
                            variant="light"
                            leftSection={<IconUserPlus size={20} />}
                            justify="space-between"
                            onClick={() => setMode("create")}
                        >
                            {t("views.auth.login.switch")}
                        </Button>
                        <Button
                            variant="filled"
                            leftSection={<IconLogin2 size={20} />}
                            justify="space-between"
                            type="submit"
                        >
                            {t("views.auth.login.submit")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}

export function AuthenticationView() {
    const { t } = useTranslation();
    const [mode, setMode] = useState<"create" | "login">("login");
    return (
        <div className="auth-wrapper">
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
                {mode === "create" ? (
                    <AuthCreatePanel setMode={setMode} />
                ) : (
                    <AuthLoginPanel setMode={setMode} />
                )}
            </Stack>
        </div>
    );
}
