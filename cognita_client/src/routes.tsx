import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/layout/Layout";
import { AuthenticationView } from "./views/auth/AuthView";
import { CollectionsView } from "./views/collections/CollectionsView";
import { HomeView } from "./views/home/HomeView";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <HomeView />,
            },
            {
                path: "/collections/:entityId?",
                element: <CollectionsView />,
            },
            {
                path: "/compendium",
                element: <></>,
            },
        ],
    },
    {
        path: "/auth",
        element: <AuthenticationView />,
    },
]);
