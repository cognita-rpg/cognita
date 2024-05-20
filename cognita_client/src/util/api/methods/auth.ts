import { User } from "../../../types/auth";
import { ApiResponseError } from "../types";
import { BaseAPIMethods, Constructor } from "./base";

export function AuthMixin<TBase extends Constructor<BaseAPIMethods>>(
    base: TBase
) {
    return class AuthMethods extends base {
        public async createUser(
            username: string,
            password: string
        ): Promise<User | ApiResponseError<string>> {
            const result = await this.request<User, string>("/auth/create", {
                method: "POST",
                body: { username, password },
            });
            if (result.success) {
                return result.data;
            } else {
                return result;
            }
        }

        public async login(
            username: string,
            password: string
        ): Promise<User | ApiResponseError<string>> {
            const result = await this.request<User, string>("/auth/login", {
                method: "POST",
                body: { username, password },
            });
            if (result.success) {
                return result.data;
            } else {
                return result;
            }
        }
    };
}
