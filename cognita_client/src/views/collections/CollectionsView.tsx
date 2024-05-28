import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CollectionEntity, ReducedEntity } from "../../types/collections";
import { CollectionsMixin, useApiMethods } from "../../util/api";
import {
    ActionIcon,
    Anchor,
    Box,
    Divider,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { FolderViewer } from "./FolderViewer";
import { IconFolderUp, IconHomeFilled } from "@tabler/icons-react";
import { FileViewer } from "./FileViewer";

function PathItem({ entity }: { entity: ReducedEntity }) {
    const nav = useNavigate();
    return (
        <>
            <Anchor
                c="var(--mantine-color-default-text)"
                onClick={() => nav(`/collections/${entity.id}`)}
            >
                {entity.name}
            </Anchor>
            <Text>/</Text>
        </>
    );
}

export function CollectionsView() {
    const { entityId } = useParams<{ entityId?: string }>();
    const [entity, setEntity] = useState<CollectionEntity | "loading" | null>(
        "loading"
    );
    const [path, setPath] = useState<ReducedEntity[]>([]);
    const api = useApiMethods(CollectionsMixin);
    const nav = useNavigate();

    useEffect(() => {
        if (entityId) {
            if (api.state === "ready") {
                setEntity("loading");

                api.get_entity(entityId).then((result) => {
                    if (result) {
                        setEntity(result);
                    } else {
                        nav("/collections");
                    }
                });

                api.get_entity_path(entityId).then(setPath);
            }
        } else {
            setEntity(null);
            setPath([]);
        }
    }, [entityId, api.state]);

    return (
        <Box className="entity-viewer">
            <Stack gap={0} className="entity-viewer-stack">
                <Group gap="sm" p="xs" wrap="nowrap">
                    <ActionIcon
                        radius="sm"
                        size="lg"
                        variant="light"
                        onClick={() => nav("/collections")}
                    >
                        <IconHomeFilled size={20} />
                    </ActionIcon>
                    {path.length > 0 && (
                        <ActionIcon
                            radius="sm"
                            size="lg"
                            variant="light"
                            onClick={() => {
                                if (path.length === 1) {
                                    nav("/collections");
                                } else {
                                    nav(`/collections/${path.at(-2)?.id}`);
                                }
                            }}
                        >
                            <IconFolderUp size={20} />
                        </ActionIcon>
                    )}
                    <Paper className="entity-path" radius="sm" withBorder>
                        {path.length > 0 ? (
                            <Group gap="xs">
                                <Text>/</Text>
                                {path.map((v) => (
                                    <PathItem entity={v} key={v.id} />
                                ))}
                            </Group>
                        ) : (
                            "/"
                        )}
                    </Paper>
                </Group>
                <Divider />
                <Box className="entity-content" style={{ flexGrow: 1 }}>
                    {entity === "loading" ? (
                        <Loader className="entity-loader" />
                    ) : entity === null || entity.type === "folder" ? (
                        <FolderViewer entity={entity} />
                    ) : entity.type === "file" ? (
                        <FileViewer entity={entity} />
                    ) : (
                        <></>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
