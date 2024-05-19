import { useContext } from "react";
import { ApiProvider } from "./ApiProvider";
import {
    ApiContext,
    ApiContextModel,
    ApiReponseSuccess,
    ApiResponse,
    ApiResponseError,
    RequestFunction,
    RequestOptions,
    isFailure,
    isSuccess,
} from "./types";
import { Session, User } from "../../types/auth";

export function useApi(): ApiContextModel {
    const context = useContext(ApiContext);
    return context;
}

export function useApiState(): "loading" | "ready" | "failed" {
    return useApi().state;
}

export function useRequest(): RequestFunction {
    const api = useApi();
    if (api.state === "ready") {
        return api.request;
    } else {
        return async (_: any) => ({
            success: false,
            code: 0,
            error: "error.api.request.inactive_connection" as any,
        });
    }
}

export function useSession(): Session | null {
    const api = useApi();
    if (api.state === "ready") {
        return api.session;
    } else {
        return null;
    }
}

export function useUser(): User | null {
    const api = useApi();
    if (api.state === "ready") {
        return api.user;
    } else {
        return null;
    }
}

export { ApiProvider, ApiContext, isFailure, isSuccess };
export type {
    ApiContextModel,
    ApiReponseSuccess,
    ApiResponse,
    ApiResponseError,
    RequestFunction,
    RequestOptions,
};
