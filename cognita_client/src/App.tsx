import { MantineProvider } from "@mantine/core";
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
    console.log(i18nInst);
    return (
        <ApiProvider>
            <MantineProvider defaultColorScheme="dark">
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
