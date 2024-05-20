import { ReactNode, useCallback, useEffect, useState } from "react";
import {
    ApiContext,
    ApiResponse,
    RequestFunction,
    RequestOptions,
} from "./types";
import { AuthState } from "../../types/auth";
import { trimStart } from "lodash";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const request: RequestFunction = useCallback(
        async function <TData = any, TError = any>(
            options: RequestOptions
        ): Promise<ApiResponse<TData, TError>> {
            const path = `/api/${trimStart(options.path, "/")}${
                options.params
                    ? "?" + new URLSearchParams(options.params).toString()
                    : ""
            }`;
            const body = (options as any).body ? (options as any).body : null;
            const result = await fetch(path, {
                method: options.method ?? "GET",
                headers: body
                    ? {
                          "Content-Type": "application/json",
                      }
                    : {},
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await result.text();
            if (result.ok) {
                try {
                    return {
                        success: true,
                        data: JSON.parse(data),
                    };
                } catch {
                    return {
                        success: true,
                        data: data as any,
                    };
                }
            } else {
                try {
                    return {
                        success: false,
                        error: JSON.parse(data).detail ?? JSON.parse(data),
                        code: result.status,
                    };
                } catch {
                    return {
                        success: false,
                        error: data as any,
                        code: result.status,
                    };
                }
            }
        },
        [authState?.session?.id]
    );

    const reload = useCallback(async () => {
        setAuthState(null);
        const result = await request<AuthState>({ path: "/" });
        if (result.success) {
            setAuthState(result.data);
            setError(null);
            return result.data;
        } else {
            setAuthState(null);
            setError(result.error ?? "errors.api.connection.failed_unknown");
            return null;
        }
    }, [request]);

    useEffect(() => {
        reload();
    }, []);

    return (
        <ApiContext.Provider
            value={
                authState
                    ? {
                          state: "ready",
                          session: authState.session,
                          user: authState.user,
                          request,
                          reload,
                      }
                    : error
                    ? { state: "failed", reason: error, reload }
                    : { state: "loading", reload }
            }
        >
            {children}
        </ApiContext.Provider>
    );
}
