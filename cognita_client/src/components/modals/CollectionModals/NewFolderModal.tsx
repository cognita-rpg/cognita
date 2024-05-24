import { useTranslation } from "react-i18next";
import { CollectionsMixin, useApiMethods } from "../../../util/api";
import { useForm } from "@mantine/form";
import {
    Button,
    Group,
    Stack,
    TagsInput,
    TextInput,
    Textarea,
} from "@mantine/core";
import {
    IconCheck,
    IconFileDescription,
    IconFolderPlus,
    IconTag,
    IconX,
} from "@tabler/icons-react";
import { EventTrigger } from "../types";
import { useNotifs } from "../../../util/notifications";

export function NewFolderModal({
    trigger,
    parent,
}: {
    trigger: EventTrigger;
    parent: string | null;
}) {
    const { t } = useTranslation();
    const api = useApiMethods(CollectionsMixin);

    const form = useForm<{
        name: string;
        summary: string;
        tags: string[];
    }>({
        initialValues: {
            name: "",
            summary: "",
            tags: [],
        },
    });

    const { error, success } = useNotifs();

    return (
        <form
            onSubmit={form.onSubmit(console.log)}
            className="new-collection-folder-form"
        >
            <Stack gap="xs">
                <Group gap="xs">
                    <TextInput
                        {...form.getInputProps("name")}
                        label={t("modals.newFolder.field.name")}
                        leftSection={<IconFolderPlus size={20} />}
                        style={{ flexGrow: 1 }}
                        withAsterisk
                    />
                    <TagsInput
                        {...form.getInputProps("tags")}
                        label={t("modals.newFolder.field.tags")}
                        leftSection={<IconTag size={20} />}
                        style={{ flexGrow: 1 }}
                    />
                </Group>

                <Textarea
                    {...form.getInputProps("summary")}
                    label={t("modals.newFolder.field.summary")}
                    autosize
                    minRows={2}
                    leftSection={<IconFileDescription size={20} />}
                />
                <Group gap="sm" justify="end">
                    <Button
                        variant="light"
                        leftSection={<IconX size={20} />}
                        onClick={() => trigger("close")}
                    >
                        {t("common.action.cancel")}
                    </Button>
                    <Button
                        variant="filled"
                        leftSection={<IconCheck size={20} />}
                        disabled={form.values.name.length === 0}
                        onClick={() =>
                            api
                                .create_entity({
                                    type: "folder",
                                    name: form.values.name,
                                    summary: form.values.summary,
                                    tags: form.values.tags,
                                    parent,
                                    icon: null,
                                    color: null,
                                })
                                .then((result) => {
                                    if (result) {
                                        success(t("modals.newFolder.success"));
                                        trigger("close");
                                    } else {
                                        error(t("modals.newFolder.error"));
                                    }
                                })
                        }
                    >
                        {t("common.action.create")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
