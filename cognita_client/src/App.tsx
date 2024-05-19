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

const i18nInst = createInstance({
    fallbackLng: "en",
    lng: "en",
    resources: {
        en: {
            translation: langEn,
        },
    },
});

function App() {
    return (
        <I18nextProvider i18n={i18nInst}>
            <ApiProvider>
                <MantineProvider defaultColorScheme="dark">
                    <Notifications />
                    <ModalsProvider>
                        <div id="app">
                            <RouterProvider router={appRouter} />
                        </div>
                    </ModalsProvider>
                </MantineProvider>
            </ApiProvider>
        </I18nextProvider>
    );
}

export default App;
