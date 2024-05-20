import {
    PasswordInputProps,
    PasswordInput as MantinePasswordInput,
} from "@mantine/core";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";

export function PasswordInput(
    props: Partial<
        Omit<
            PasswordInputProps,
            "visibilityToggleIcon" | "visibilityToggleButtonProps"
        >
    >
) {
    return (
        <MantinePasswordInput
            {...props}
            visibilityToggleIcon={({ reveal }) =>
                reveal ? <IconEyeClosed size={20} /> : <IconEye size={20} />
            }
        />
    );
}
