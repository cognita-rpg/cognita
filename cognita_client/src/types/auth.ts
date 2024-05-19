export type Session = {
    id: string;
    user_id: string | null;
    creation: string;
    access: string;
};

export type User = {
    id: string;
    username: string;
};

export type AuthState = {
    session: Session;
    user: User | null;
};
