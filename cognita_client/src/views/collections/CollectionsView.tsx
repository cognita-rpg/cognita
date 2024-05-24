import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CollectionEntity, ReducedEntity } from "../../types/collections";
import { CollectionsMixin, useApiMethods } from "../../util/api";
import {
    ActionIcon,
    Box,
    Divider,
    Group,
    Loader,
    Paper,
    Stack,
} from "@mantine/core";
import { FolderViewer } from "./FolderViewer";
import { IconHomeFilled } from "@tabler/icons-react";

export function CollectionsView() {
    const { entityId } = useParams<{ entityId?: string }>();
    const [entity, setEntity] = useState<CollectionEntity | "loading" | null>(
        "loading"
    );
    const [path, setPath] = useState<ReducedEntity[]>([]);
    const api = useApiMethods(CollectionsMixin);
    const nav = useNavigate();

    console.log(entityId, entity);

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
            }
        } else {
            setEntity(null);
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
                    <Paper className="entity-path" radius="sm" withBorder>
                        /
                    </Paper>
                </Group>
                <Divider />
                <Box className="entity-content" style={{ flexGrow: 1 }}>
                    {entity === "loading" ? (
                        <Loader className="entity-loader" />
                    ) : entity === null || entity.type === "folder" ? (
                        <FolderViewer entity={entity} />
                    ) : entity.type === "file" ? (
                        <></>
                    ) : (
                        <></>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
