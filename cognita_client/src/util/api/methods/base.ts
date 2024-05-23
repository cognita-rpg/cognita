import { omit } from "lodash";
import { Session, User } from "../../../types/auth";
import { ApiContextModel, ApiResponse, RequestOptions } from "../types";

export class BaseAPIMethods {
    constructor(public apiContext: ApiContextModel) {}

    public set context(v: ApiContextModel) {
        this.apiContext = v;
    }

    public get context() {
        return this.apiContext;
    }

    public get session(): Session | null {
        return this.apiContext.state === "ready"
            ? this.apiContext.session
            : null;
    }

    public get user(): User | null {
        return this.apiContext.state === "ready" ? this.apiContext.user : null;
    }

    public get state() {
        return this.apiContext.state;
    }

    public async request<TData = any, TError = any>(
        path: string,
        options?: Partial<RequestOptions>
    ): Promise<ApiResponse<TData, TError>> {
        if (this.apiContext.state === "ready") {
            return await this.apiContext.request<TData, TError>({
                path,
                ...omit(options ?? {}, "path"),
            });
        } else {
            return {
                success: false,
                code: 0,
                error: "error.api.connection.disconnected" as any,
            };
        }
    }
}

export type Constructor<T extends object> = new (...args: any[]) => T;

export type APIMixin<
    TBase extends Constructor<any>,
    TMixin extends BaseAPIMethods
> = (base: TBase) => TMixin;
