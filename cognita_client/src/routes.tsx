import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/layout/Layout";
import { AuthenticationView } from "./views/auth/AuthView";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [],
    },
    {
        path: "/auth",
        element: <AuthenticationView />,
    },
]);
