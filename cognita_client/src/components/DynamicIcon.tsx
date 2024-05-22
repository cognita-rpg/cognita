import { IconProps } from "@tabler/icons-react";
import * as IconsReact from "@tabler/icons-react";
import { camelCase, upperFirst } from "lodash";
import { ReactNode } from "react";

export function DynamicIcon({
    name,
    fallback,
    ...props
}: {
    name: string;
    fallback?: (props: any) => ReactNode;
} & Partial<IconProps>) {
    let DynamicElement: (props?: any) => ReactNode;
    if (
        Object.keys(IconsReact).includes(`Icon${upperFirst(camelCase(name))}`)
    ) {
        DynamicElement = (IconsReact as any)[
            `Icon${upperFirst(camelCase(name))}`
        ];
    } else {
        DynamicElement = fallback ?? IconsReact.IconQuestionMark;
    }

    return <DynamicElement {...props} />;
}
