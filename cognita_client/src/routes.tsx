import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/layout/Layout";
import { AuthenticationView } from "./views/auth/AuthView";
import { CollectionsView } from "./views/collections/CollectionsView";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <></>,
            },
            {
                path: "/collections/*",
                element: <CollectionsView />,
            },
            {
                path: "/compendium/*",
                element: <></>,
            },
        ],
    },
    {
        path: "/auth",
        element: <AuthenticationView />,
    },
]);
