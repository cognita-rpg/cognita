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
import { useApiMethods, AuthMixin, isFailure } from "../../util/api";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { PasswordInput } from "../../components/PasswordInput";
import { useNavigate } from "react-router-dom";
import { useNotifs } from "../../util/notifications";

function AuthCreatePanel({
    setMode,
}: {
    setMode: (mode: "create" | "login") => void;
}) {
    const { t } = useTranslation();
    const api = useApiMethods(AuthMixin);
    const nav = useNavigate();
    const { success, error } = useNotifs();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
            passwordConfirm: "",
        },
        validate: {
            username: (username) => {
                return username.length > 0
                    ? null
                    : t("error.common.field.empty");
            },
            password: (password, { passwordConfirm }) => {
                return password === passwordConfirm && password.length > 0
                    ? null
                    : t("error.view.auth.create.password_match");
            },
            passwordConfirm: (passwordConfirm, { password }) => {
                return password === passwordConfirm && password.length > 0
                    ? null
                    : t("error.view.auth.create.password_match");
            },
        },
    });
    return (
        <Paper className="auth-section create" p="sm" radius="sm">
            <form
                onSubmit={form.onSubmit(({ username, password }) =>
                    api.createUser(username, password).then((value) => {
                        if (isFailure(value)) {
                            error(
                                t("error.view.create.failed", {
                                    reason: t(value.error ?? "error.unknown"),
                                })
                            );
                        } else {
                            success(t("views.auth.create.success"));
                            nav("/");
                        }
                    })
                )}
            >
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
    const api = useApiMethods(AuthMixin);
    const nav = useNavigate();
    const { success, error } = useNotifs();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (username) => {
                return username.length > 0
                    ? null
                    : t("error.common.field.empty");
            },
            password: (password) => {
                return password.length > 0
                    ? null
                    : t("error.common.field.empty");
            },
        },
    });
    return (
        <Paper className="auth-section login" p="sm" radius="sm">
            <form
                onSubmit={form.onSubmit(({ username, password }) =>
                    api.login(username, password).then((value) => {
                        if (isFailure(value)) {
                            console.log(value);
                            error(
                                t("error.view.login.failed", {
                                    reason: t(value.error ?? "error.unknown"),
                                })
                            );
                        } else {
                            success(t("views.auth.login.success"));
                            nav("/");
                        }
                    })
                )}
            >
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
