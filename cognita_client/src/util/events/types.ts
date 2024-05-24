import { createContext } from "react";

export type Event<TData> = {
    id: string;
    event_type: string;
    data: TData | null;
};

export type EventContextType = {
    registerListener: <TData = any>(
        id: string,
        eventType: string,
        callback: (data: TData | null) => void
    ) => void;
    deregisterListener: (id: string) => void;
};

export const EventContext = createContext<EventContextType>({
    registerListener: () => {},
    deregisterListener: () => {},
});
