import { createContext } from "react";
import { AuthState, Session, User } from "../../types/auth";

export type ApiReponseSuccess<TData> = {
    success: true;
    data: TData;
};

export type ApiResponseError<TError> = {
    success: false;
    error: TError | null;
    code: number;
};

export type ApiResponse<TData = any, TError = string> =
    | ApiReponseSuccess<TData>
    | ApiResponseError<TError>;

export function isSuccess<TData = any>(
    obj: ApiResponse<TData>
): obj is ApiReponseSuccess<TData> {
    return obj.success;
}

export function isFailure<TError = any>(
    obj: ApiResponse<any, TError>
): obj is ApiResponseError<TError> {
    return !obj.success;
}

export type RequestOptions =
    | {
          method?: "GET" | "DELETE";
          path: string;
          params?: { [key: string]: any };
      }
    | {
          method: "POST" | "PUT" | "PATCH";
          path: string;
          params?: { [key: string]: any };
          body?: object;
      };

export type RequestFunction = <TData = any, TError = any>(
    options: RequestOptions
) => Promise<ApiResponse<TData, TError>>;

export type ApiContextModel =
    | {
          state: "loading";
          reload: () => Promise<AuthState | null>;
      }
    | {
          state: "ready";
          session: Session;
          user: User | null;
          request: RequestFunction;
          reload: () => Promise<AuthState | null>;
      }
    | {
          state: "failed";
          reason: string;
          reload: () => Promise<AuthState | null>;
      };

export const ApiContext = createContext<ApiContextModel>({
    state: "failed",
    reason: "error.api.connection.context",
    reload: async () => null,
});
