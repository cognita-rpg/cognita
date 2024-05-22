import { ActionIcon, Box, ScrollArea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export function CollectionsView() {
    return (
        <Box className="collections-main">
            <ScrollArea className="collections-scroll" p="sm"></ScrollArea>
            <ActionIcon radius="xl" size="xl" className="add-item-button">
                <IconPlus />
            </ActionIcon>
        </Box>
    );
}
