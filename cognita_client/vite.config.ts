import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "https://api:8000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                secure: false,
            },
            "/api/events": {
                target: "wss://api:8000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                ws: true,
                secure: false,
            },
        },
        https: {
            key: readFileSync("/cognita/certs/client/key.pem"),
            cert: readFileSync("/cognita/certs/client/cert.pem"),
        },
    },
});
