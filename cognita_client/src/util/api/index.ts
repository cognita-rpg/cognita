import { useContext, useEffect, useState } from "react";
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
import { BaseAPIMethods, APIMixin, AuthMixin, PluginMixin } from "./methods";
import { UnionToIntersection, ValuesType } from "utility-types";

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

export function useApiMethods<TMixins extends APIMixin<any, any>[]>(
    ...mixins: TMixins
): typeof BaseAPIMethods &
    UnionToIntersection<ReturnType<ValuesType<TMixins>>["prototype"]> {
    const api = useApi();
    const [methods, setMethods] = useState(
        new (mixins.reduce((prev, current) => current(prev), BaseAPIMethods))(
            api
        )
    );

    useEffect(
        () =>
            setMethods((current) => {
                current.context = api;
                return current;
            }),
        [api]
    );

    return methods as any;
}

export {
    ApiProvider,
    ApiContext,
    isFailure,
    isSuccess,
    BaseAPIMethods,
    AuthMixin,
    PluginMixin,
};
export type {
    ApiContextModel,
    ApiReponseSuccess,
    ApiResponse,
    ApiResponseError,
    RequestFunction,
    RequestOptions,
};
