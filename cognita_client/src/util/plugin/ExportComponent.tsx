import { ReactNode, useEffect, useState } from "react";
import { PluginComponentExport } from "../../types/plugin";
import { FullExport } from "./types";
import { Alert, Loader } from "@mantine/core";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { IconX } from "@tabler/icons-react";

export function ExportedComponent<TProps extends object = any>({
    exported,
    fallback,
    error,
    ...props
}: {
    exported: FullExport<PluginComponentExport>;
    fallback?: (props?: Partial<TProps>) => ReactNode;
    error?: (props: FallbackProps) => ReactNode;
} & Partial<TProps>) {
    const [RenderElement, setRenderElement] = useState<
        (props?: Partial<TProps>) => ReactNode
    >(fallback ? fallback : () => <Loader />);
    const { t } = useTranslation();
    useEffect(() => {
        if (exported.resolver) {
            exported
                .resolver()
                .then((result) =>
                    result
                        ? setRenderElement(result)
                        : setRenderElement(
                              fallback ? fallback : () => <Loader />
                          )
                );
        } else {
            setRenderElement(fallback ? fallback : () => <Loader />);
        }
    }, [exported.resolver]);

    return (
        <ErrorBoundary
            fallbackRender={
                error
                    ? error
                    : (props) => (
                          <Alert
                              variant="light"
                              color="red"
                              icon={<IconX size={20} />}
                              title={t("error.plugin.render", {
                                  plugin: exported.pluginName,
                                  exported: exported.exportName,
                              })}
                          >
                              {props.error.toString()}
                          </Alert>
                      )
            }
        >
            <RenderElement {...(props as any)} />
        </ErrorBoundary>
    );
}
