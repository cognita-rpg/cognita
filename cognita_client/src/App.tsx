import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./routes";
import "./sass/index.scss";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import * as langEn from "./lang/en.json";
import { ApiProvider } from "./util/api";
import { useMemo } from "react";

function App() {
    const i18nInst = useMemo(() => {
        const instance = createInstance({
            fallbackLng: "en",
            lng: "en",
            resources: {
                en: {
                    translation: langEn,
                },
            },
        });
        instance.init();
        return instance;
    }, []);

    const theme = createTheme({
        fontFamily: "'Roboto', sans-serif",
        colors: {
            primary: [
                "#ffe9ff",
                "#fed2fc",
                "#f7a3f4",
                "#f271ee",
                "#ed48e7",
                "#ea2de4",
                "#ea1ce3",
                "#d00cc9",
                "#b902b5",
                "#a3009e",
            ],
        },
        primaryColor: "primary",
        primaryShade: 4,
    });
    return (
        <ApiProvider>
            <MantineProvider
                defaultColorScheme="dark"
                theme={theme}
                withCssVariables
            >
                <I18nextProvider i18n={i18nInst} defaultNS={"translation"}>
                    <Notifications />
                    <ModalsProvider>
                        <RouterProvider router={appRouter} />
                    </ModalsProvider>
                </I18nextProvider>
            </MantineProvider>
        </ApiProvider>
    );
}

export default App;
